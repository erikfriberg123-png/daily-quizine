export interface SegmentConfig {
  id: string
  name: string
  subtitle: string
  icon: string
  heroLine1: string
  heroLine2Start: string
  heroEm: string
  heroCopyLine1: string
  heroCopyLine2: string
  cardTitle: string
  cardIcon: string
  startBtnIcon: string
  showStoryButton: boolean
  showBackLink: boolean
  localStoragePrefix: string
  showEkg: boolean
  ctaUrl: string
  ctaLabel: string
}

export const SEGMENT: string = __SEGMENT__

const CONFIGS: Record<string, SegmentConfig> = {
  quizine: {
    id: 'quizine',
    name: 'Quizine Daily',
    subtitle: 'Quiz om krogen',
    icon: '🎯',
    heroLine1: 'Dagens quiz',
    heroLine2Start: 'är ',
    heroEm: 'serverat.',
    heroCopyLine1: 'Visa vad du kan om livet på krogen.',
    heroCopyLine2: 'Tävla med kollegorna.',
    cardTitle: 'Dagens meny',
    cardIcon: '📋',
    startBtnIcon: '🎯',
    showStoryButton: true,
    showBackLink: false,
    localStoragePrefix: 'dq_',
    showEkg: false,
    ctaUrl: 'https://quizine.se',
    ctaLabel: '⚔️ Vill du spela mer? Besök Quizine.se',
  },
  voo: {
    id: 'voo',
    name: 'Quizine Daily',
    subtitle: 'Vård & Omsorg',
    icon: '🩺',
    heroLine1: 'Dagens quiz är',
    heroLine2Start: '',
    heroEm: 'ordinerat.',
    heroCopyLine1: 'Visa vad du kan om livet i vården.',
    heroCopyLine2: 'Tävla med dina kollegor.',
    cardTitle: 'Dagens journal',
    cardIcon: '💉',
    startBtnIcon: '🩺',
    showStoryButton: false,
    showBackLink: true,
    localStoragePrefix: 'voo_',
    showEkg: true,
    ctaUrl: 'https://quizine.se',
    ctaLabel: '🩺 Vill du spela mer? Besök quizine.se',
  },
}

export function getSegmentConfig(): SegmentConfig {
  return CONFIGS[SEGMENT] ?? CONFIGS.quizine
}
