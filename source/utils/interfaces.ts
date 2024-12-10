export interface ProjectData {
  version: number
  projects: Project[]
}

export interface Project {
  name: string
  id: string
  description: string
  health: number
  favorite: boolean
  featureCount: number
  memberCount: number
  createdAt: string
  archivedAt: any
  mode: string
  lastReportedFlagUsage?: string
  lastUpdatedAt: string
  owners: Owner[]
}

export interface Owner {
  ownerType: string
  name?: string
  email?: string
  imageUrl?: string
}

export interface Constraint {
  values: string[]
  inverted: boolean
  operator: string
  contextName: string
  caseInsensitive: boolean
}

export interface Variant {
  name: string
  weight: number
  stickiness: string
  weightType: string
}

export interface Parameters {
  groupId: string
  rollout: string
  stickiness: string
}

export interface Strategy {
  name: string
  constraints: Constraint[]
  variants: Variant[]
  parameters: Parameters
  segments: number[]
  sortOrder: number
  id: string
  title: string
  disabled: boolean
}

export interface Environment {
  name: string
  lastSeenAt?: string
  enabled: boolean
  yes: number
  no: number
  type: string
  sortOrder: number
  strategies: Strategy[]
}

export interface FeatureToggle {
  name: string
  description: string
  type: string
  createdAt: string
  lastSeenAt: string
  project: string
  stale: boolean
  impressionData: boolean
  archived: boolean
  environments: Environment[]
  lifecycle: {
    stage: string
    enteredStageAt: string
  }
}

export interface BasicEnvironment {
  name: string
  enabled: boolean
  type: string
  sortOrder: number
  variantCount: number
  lastSeenAt: string
  hasStrategies: boolean
  hasEnabledStrategies: boolean
}

export interface FeatureToggleListItem {
  name: string
  description: string
  type: 'experiment' | 'release' | 'kill-switch'
  createdAt: string
  favorite: boolean
  lastSeenAt: string
  project: string
  stale: boolean
  environments: BasicEnvironment[]
  impressionData: boolean
}

//===

export interface EnvironmentStrategy {
  id: string
  name: string
  constraints: Constraint[]
  parameters: Parameters
  variants: Variant[]
  title: string
  disabled: boolean
  sortOrder: number
  segments: number[]
}

export interface SegmentData {
  segments: Segment[]
}

export interface Segment {
  id: number
  name: string
  description: string
  constraints: Constraint[]
  createdBy: string
  createdAt: string
  usedInProjects: number
  usedInFeatures: number
  project?: string
}

export interface Constraint {
  value?: string
  values: string[]
  inverted: boolean
  operator: string
  contextName: string
  caseInsensitive: boolean
}
