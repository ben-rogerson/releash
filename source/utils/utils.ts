import chalk from 'chalk'

export const pluralise = (word: string, count: number, replace?: string) =>
  count === 1 ? word : replace ?? `${word}s`

export const daysAgo = (date: string) => {
  const diff = new Date().getTime() - new Date(date).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export const getVariantEmoji = (i: number) =>
  ['🟣', '🟡', '🟢', '🔵', '🟠', '🔴'][i] ?? '🟤'

export const getEnvironmentEmoji = (name: string) =>
  (name === 'production' && '🔴') || (name === 'preproduction' && '🟠') || '🟢'

export const colorNotice = (text: string) => chalk.hex('#F7F05A').bold(text)

export const colorMuted = (text: string) => chalk.gray(text)
