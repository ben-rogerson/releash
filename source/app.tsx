import React, { Fragment, useEffect, useState, type ReactNode } from 'react'
import { Box, Newline, Text, useInput, type BoxProps } from 'ink'
import chalk from 'chalk'
import groupBy from 'object.groupby'
import SelectInput from 'ink-select-input'
import Table from 'cli-table3'
import Spinner from 'ink-spinner'
import { api, getUrl, ROUTES } from './utils/api.js'
import { config } from './utils/config.js'
import {
  colorMuted,
  colorNotice,
  daysAgo,
  getEnvironmentEmoji,
  getVariantEmoji,
  pluralise,
} from './utils/utils.js'
import type {
  BasicEnvironment,
  EnvironmentStrategy,
  FeatureToggleListItem,
  Project,
  ProjectData,
  Segment,
  SegmentData,
} from './utils/interfaces.js'

const useProjects = () => {
  const [data, setData] = useState<Project[]>([])
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (data.length > 0) return

    const getData = async () => {
      setIsFetching(true)
      const data = await api.get<ProjectData>(`${ROUTES.API_ADMIN}/projects`)
      setData(data.projects)
      setIsFetching(false)
    }
    getData()
  }, [])

  return { projects: data, isFetching }
}

const ProjectPicker = ({
  projects,
  setSelectedProjectId,
  projectPrevious,
  setProjectPrevious,
}: {
  projects: Project[]
  setSelectedProjectId: (projectId: string) => void
  projectPrevious: string
  setProjectPrevious: (projectId: string) => void
}) => {
  if (projects.length === 0) return <Text color="red">No projects found.</Text>

  const { favorite = [], normal = [] } = groupBy(
    projects.toSorted((a, b) => b.featureCount - a.featureCount),
    ({ favorite }: Project) => (favorite ? 'favorite' : 'normal')
  )

  const items = [...(favorite ?? []), ...(normal ?? [])].map((p) => ({
    label: `${p.favorite ? '✨' : ''}${p.name} ${chalk.reset(
      colorMuted(`(${p.featureCount} ${pluralise('flag', p.featureCount)})`)
    )}`,
    value: p.name,
    featureCount: p.featureCount,
  }))

  return (
    <>
      <SelectInput
        items={items}
        indicatorComponent={() => <Text>{colorMuted('- ')}</Text>}
        itemComponent={({ isSelected = false, label }) => (
          <Text>{isSelected ? colorNotice(label) : label}</Text>
        )}
        onSelect={(item) => {
          setSelectedProjectId(item.value)
          setProjectPrevious(item.value)
        }}
        limit={20}
        initialIndex={
          projectPrevious
            ? items.findIndex((f) => f.value === projectPrevious) ?? 0
            : undefined
        }
        isFocused
      />
      <Text>
        {'  '}
        {colorMuted(`${items.length > 1 ? `▼▲ to scroll, ` : ''}↵ to select`)}
      </Text>
    </>
  )
}

const useSegments = () => {
  const [data, setData] = useState<Segment[]>([])
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (data.length > 0) return

    const getData = async () => {
      setIsFetching(true)
      const data = await api.get<SegmentData>(`${ROUTES.API_ADMIN}/segments`)
      setData(data.segments)
      setIsFetching(false)
    }
    getData()
  }, [])

  return { segments: data, isFetching }
}

const useStrategies = (
  projectId: string,
  flag: FeatureToggleListItem['name'],
  environment: BasicEnvironment['name']
) => {
  const [data, setData] = useState<EnvironmentStrategy[]>([])
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    const getData = async () => {
      setIsFetching(true)
      const data = await api.get<EnvironmentStrategy[]>(
        `${ROUTES.API_ADMIN}/projects/${
          projectId === 'Default' ? 'default' : projectId
        }/features/${flag}/environments/${environment}/strategies`
      )
      setData(data)
      setIsFetching(false)
    }
    getData()
  }, [flag, environment])

  return { strategies: data, isFetching }
}

const renderTable = (columns: string[], rows: any[]) => {
  const table = new Table({
    head: columns,
    style: {
      head: ['white', 'bold'],
      border: ['dim'],
      compact: true,
    },
  })
  table.push(...rows)
  return table.toString()
}

const Divider = ({ color = 'gray' }: { color?: BoxProps['borderColor'] }) => (
  <Box
    borderColor={color}
    borderStyle="single"
    borderBottom={true}
    borderTop={false}
    borderLeft={false}
    borderRight={false}
  />
)

const StrategyCard = ({
  s,
  children,
  after,
  segments,
}: {
  s: EnvironmentStrategy
  children: ReactNode
  after?: ReactNode
  segments?: ReactNode
}) => (
  <Box
    flexDirection="column"
    borderStyle="doubleSingle"
    borderColor="gray"
    paddingX={1}
    alignSelf="flex-start"
  >
    <Box flexDirection="column">
      {children}

      {s.parameters.stickiness && s.parameters.stickiness !== 'default' && (
        <Text>
          <Text bold>Stickiness: </Text>
          <Text>{chalk.green(s.parameters.stickiness)}</Text>
        </Text>
      )}
      <Divider />
      <Text bold>Targeting</Text>
      <Box flexDirection="column">
        {segments}
        {s.constraints.length > 0 && (
          <Text key={s.id}>
            {s.constraints?.map((c, i) => (
              <Text key={c.values.join(',')}>
                {i > 0 && <Newline />}
                {`${chalk.green(
                  `${c.contextName}${c.inverted ? ' NOT ' : ' '}${c.operator}`
                )} (${[c.value, ...c.values]
                  .filter(Boolean)
                  .map((v) => `"${chalk.green(v)}"`)
                  .join(', ')})`}
                {c.caseInsensitive === false && <Text> (Case sensitive)</Text>}
                {s.parameters.rollout && <Text> AND</Text>}
              </Text>
            ))}
          </Text>
        )}
        {s.parameters.rollout && (
          <>
            <Text>
              {(s.parameters.rollout === '0' &&
                chalk.red(`${s.parameters.rollout}%`)) ||
                (s.parameters.rollout < '100' &&
                  chalk.yellowBright(`${s.parameters.rollout}%`)) ||
                chalk.green(`${s.parameters.rollout}%`)}{' '}
              {s.constraints.length > 0
                ? 'of users are included'
                : 'of users are included'}
              .
            </Text>
          </>
        )}
        {s.constraints.length === 0 && !s.parameters.rollout && (
          <Text>{chalk.green('On')} for all users.</Text>
        )}

        {after}
      </Box>
    </Box>
  </Box>
)

const StrategyDetails = ({
  projectId,
  flag,
  environment,
}: {
  projectId: string
  flag: FeatureToggleListItem['name']
  environment: BasicEnvironment['name']
}) => {
  const { strategies, isFetching: isFetchingStrategies } = useStrategies(
    projectId,
    flag,
    environment
  )
  const { enabled = [], disabled = [] } = groupBy(strategies, ({ disabled }) =>
    disabled ? 'disabled' : 'enabled'
  )

  const { segments, isFetching: isFetchingSegments } = useSegments()

  if (isFetchingStrategies || isFetchingSegments)
    return (
      <Box
        flexDirection="column"
        borderStyle="doubleSingle"
        borderColor="gray"
        paddingX={1}
        alignSelf="flex-start"
      >
        <Text>
          <Spinner type="circleHalves" /> Fetching strategies&hellip;
        </Text>
      </Box>
    )

  return (
    <>
      {enabled?.map((s, i) => {
        const variantRows = s.variants
          ?.toSorted((a, b) => b.weight - a.weight)
          .map((v, i) => {
            const weight = v.weight / 1000
            return [
              v.weight === 0
                ? colorMuted(`${getVariantEmoji(i)} ${v.name}`)
                : `${getVariantEmoji(i)} ${v.name}`,
              (weight === 0 && colorMuted(`0%`)) ||
                chalk.green(`${Math.round(weight * 100 * 100) / 100}%`),
              v.weight === 0 ? colorMuted(v.stickiness) : v.stickiness,
            ]
          })

        const matchedSegments = segments
          .filter((seg) => s.segments.includes(seg.id))
          .map((seg) => chalk.green(seg.name))
          .join(', ')

        return (
          <Fragment key={i}>
            <StrategyCard
              s={s}
              after={
                variantRows.length > 0 && (
                  <Text>
                    {renderTable(
                      ['Variant', 'Weight', 'Stickiness'],
                      variantRows
                    )}
                  </Text>
                )
              }
              segments={
                matchedSegments ? (
                  <Text>
                    {matchedSegments}
                    {(s.constraints.length > 0 || s.parameters.rollout) &&
                      ' AND'}
                  </Text>
                ) : undefined
              }
            >
              <Text bold>
                {enabled.length > 1 ? `Strategy ${i + 1}. ` : ''}
                {[
                  s.name === 'flexibleRollout' && 'Gradual rollout',
                  (s.title ?? s.name) && `"${s.title ?? s.name}"`,
                ]
                  .filter(Boolean)
                  .join(' ')}
              </Text>
            </StrategyCard>
          </Fragment>
        )
      })}

      {disabled?.length > 0 && (
        <Text>
          {colorMuted(enabled.length > 0 ? 'and ' : '')}
          {chalk.reset(`${disabled.length} disabled`)}{' '}
          {pluralise('strategy', disabled.length, 'strategies')}
          {colorMuted('.')}
        </Text>
      )}
    </>
  )
}

const useFlags = (projectId?: string) => {
  const [data, setData] = useState<FeatureToggleListItem[]>([])
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (!projectId) return

    const getData = async () => {
      setIsFetching(true)
      const flagData = await api.get<{
        features: FeatureToggleListItem[]
      }>(
        `${ROUTES.API_ADMIN}/projects/${
          // Fix default casing
          projectId === 'Default' ? 'default' : projectId
        }/features`
      )
      setData(flagData.features)
      setIsFetching(false)
    }
    getData()
  }, [projectId])

  return { flags: data, isFetching }
}

const useKeepAlive = () =>
  useEffect(() => {
    setInterval(() => {}, 100)
  }, [])

const FlagPicker = ({
  flags,
  setFlag,
  flagPrevious,
  setFlagPrevious,
}: {
  flags: FeatureToggleListItem[]
  setFlag: (flag: string) => void
  flagPrevious: string
  setFlagPrevious: (flag: string) => void
}) => {
  const sortedFlags = flags.toSorted((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  )

  const items = groupBy(sortedFlags, ({ favorite }: FeatureToggleListItem) =>
    favorite ? 'favorite' : 'normal'
  )

  const finalItems = [...(items.favorite ?? []), ...(items.normal ?? [])].map(
    (f) => {
      const daysBack = daysAgo(f.createdAt)
      return {
        label: `${colorNotice(daysBack === 0 ? 'today' : `${daysBack}d`)} ${
          f.name
        } ${chalk.reset(colorMuted(`(${f.type})`))} ${
          f.stale ? chalk.red('Stale') : ''
        }`,
        value: f.name.toLowerCase(),
        name: f.name, // Just for sorting
      }
    }
  )

  if (finalItems.length === 0)
    return (
      <>
        <Text>No flags found.</Text>
      </>
    )

  return (
    <>
      <SelectInput
        items={finalItems}
        indicatorComponent={() => <Text>{colorMuted('- ')}</Text>}
        itemComponent={({ isSelected = false, label }) => (
          <Text color="white">{isSelected ? colorNotice(label) : label}</Text>
        )}
        onSelect={(item) => {
          setFlag(item?.value)
          setFlagPrevious(item?.value)
        }}
        limit={15}
        initialIndex={
          flagPrevious
            ? finalItems.findIndex((f) => f.name === flagPrevious) ?? 0
            : undefined
        }
        isFocused
      />
      <Text>
        {'  '}
        {colorMuted(
          `${
            finalItems.length > 1 ? `▼▲ to scroll, ` : ''
          }↵ to select, ␛ for projects`
        )}
      </Text>
    </>
  )
}

const Overview = ({
  flag,
  environments,
}: {
  flag: FeatureToggleListItem
  environments: { enabled: number; disabled: number }
}) => (
  <Box flexDirection="column">
    {flag.description && <Text italic>{flag.description}</Text>}
    <Text>
      {renderTable(
        ['Type', 'Environments', 'Stale', 'Impression data', 'Created'],
        [
          [
            flag.type,
            [
              environments.disabled > 0 && `${environments.disabled} off`,
              environments.enabled > 0 && `${environments.enabled} on`,
            ]
              .filter(Boolean)
              .join(', '),
            flag.stale ? chalk.red('Stale') : 'No',
            flag.impressionData ? chalk.green('Yes') : chalk.green('No'),
            `${flag.createdAt} (${daysAgo(flag.createdAt)}d ago)`,
          ],
        ]
      )}
    </Text>
  </Box>
)

export default function App({
  project: cliProject,
}: {
  project: string | undefined
}) {
  const [flag, setFlag] = useState<FeatureToggleListItem['name']>('')

  const { projects, isFetching: isFetchingProjects } = useProjects()

  const [projectPrevious, setProjectPrevious] = useState<string>('')

  const [flagPrevious, setFlagPrevious] =
    useState<FeatureToggleListItem['name']>('')

  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // Auto select project if provided via CLI
  cliProject = cliProject ?? config.project
  useEffect(() => {
    if (!cliProject) return
    if (!projects) return

    const foundProject = projects.find(
      (p) => p.id.toLowerCase() === cliProject.toLowerCase()
    )
    if (foundProject) {
      setSelectedProjectId(foundProject.name)
      return
    }
    const laxName =
      (cliProject.length > 1 &&
        projects.find((p) =>
          p.id.toLowerCase().startsWith(cliProject.toLowerCase())
        )) ??
      projects.find((p) =>
        p.id.toLowerCase().includes(cliProject.toLowerCase())
      )
    if (laxName) setSelectedProjectId(laxName.name)
  }, [cliProject, projects])

  const currentProject = projects.find((p) => p.name === selectedProjectId)

  const { flags, isFetching: isFetchingFlags } = useFlags(currentProject?.id)

  const currentFlag = flags.find((f) => f.name.toLowerCase() === flag)
  const {
    enabled: enabledEnvironments = [],
    disabled: disabledEnvironments = [],
  } = groupBy(
    currentFlag?.environments ?? [],
    ({ enabled }: BasicEnvironment) => (enabled ? 'enabled' : 'disabled')
  )

  const [environment, setEnvironment] =
    useState<EnvironmentStrategy['name']>('')

  useKeepAlive()

  useInput((_, key) => {
    if (key.escape || key.leftArrow) {
      if (environment) {
        setEnvironment('')
        setFlagPrevious(flag)
        setFlag('')
        return
      }
      if (flag) {
        setFlagPrevious(flag)
        setFlag('')
        return
      }
      if (selectedProjectId) {
        setProjectPrevious(selectedProjectId)
        setSelectedProjectId('')
        return
      }
    }
  })

  const currentEnvironment = (enabledEnvironments ?? []).find(
    (e) => e.name === environment
  )

  const showFlagPicker = selectedProjectId && !currentFlag
  const showEnvironmentDetail = selectedProjectId && currentFlag

  const header = (
    <Box flexDirection="column" marginY={1}>
      <Text bold>
        <Text>Releash </Text>
        {!isFetchingProjects && !Boolean(selectedProjectId) && (
          <Text>
            ({projects.length} {pluralise('project', projects.length)})
          </Text>
        )}
        {showFlagPicker && (
          <Text>
            {colorMuted('›')} {currentProject?.name} (
            {isFetchingFlags ? <Spinner type="circleHalves" /> : flags.length}{' '}
            feature {pluralise('flag', flags.length)})
          </Text>
        )}
        {showEnvironmentDetail && (
          <Text>
            {colorMuted('›')} {currentProject?.name} {colorMuted('›')}{' '}
            {currentFlag.name}
          </Text>
        )}
      </Text>
    </Box>
  )

  const unleashUrl = [
    `${getUrl(config.url)}projects`,
    currentProject?.id &&
      (currentProject?.id === 'Default' ? 'default' : currentProject?.id),
    currentProject?.id && 'features',
    currentFlag?.name,
  ]
    .filter(Boolean)
    .join('/')

  return (
    <>
      {header}

      {!selectedProjectId &&
        (isFetchingProjects ? (
          <Text>
            <Spinner type="circleHalves" /> Fetching projects&hellip;
          </Text>
        ) : (
          <ProjectPicker
            projects={projects}
            setSelectedProjectId={setSelectedProjectId}
            projectPrevious={projectPrevious}
            setProjectPrevious={setProjectPrevious}
          />
        ))}

      {showFlagPicker &&
        (isFetchingFlags ? (
          <Text>
            <Spinner type="circleHalves" /> Fetching flags&hellip;
          </Text>
        ) : (
          <>
            <FlagPicker
              flags={flags}
              setFlag={setFlag}
              flagPrevious={flagPrevious}
              setFlagPrevious={setFlagPrevious}
            />
          </>
        ))}

      {showEnvironmentDetail && (
        <>
          <Box flexDirection="column" marginBottom={1}>
            <SelectInput
              items={[
                { label: '👈 Back', value: '' },
                ...enabledEnvironments.reverse().map((e) => {
                  return {
                    label: `${getEnvironmentEmoji(e.type)} ${e.name} ${
                      e.type && e.type !== 'string'
                        ? colorMuted(`(${e.type})`)
                        : ''
                    }`,
                    value: e.name,
                  }
                }),
              ]}
              indicatorComponent={() => null}
              onSelect={(item) => {
                if (item.value === '') {
                  setFlag('')
                  setFlagPrevious(flag)
                }
              }}
              onHighlight={(item) => {
                setEnvironment(item.value)
              }}
              itemComponent={({ isSelected = false, label }) => (
                <Text>{isSelected ? colorNotice(label) : label}</Text>
              )}
              isFocused
            />
            {enabledEnvironments.length === 0 &&
              disabledEnvironments.length > 0 && (
                <Text>
                  <Newline />
                  {chalk.red(
                    '🚧 All environments are disabled. Enable some environments to see the strategies.'
                  )}
                </Text>
              )}
          </Box>

          <Box flexDirection="column">
            {currentEnvironment ? (
              <StrategyDetails
                projectId={currentProject?.id ?? ''}
                flag={currentFlag.name}
                environment={currentEnvironment.name}
              />
            ) : (
              <Overview
                flag={currentFlag}
                environments={{
                  enabled: enabledEnvironments.length,
                  disabled: disabledEnvironments.length,
                }}
              />
            )}
          </Box>
        </>
      )}

      <Box flexDirection="column" marginTop={1}>
        <Text dimColor>🌐Link ({unleashUrl})</Text>
      </Box>
    </>
  )
}
