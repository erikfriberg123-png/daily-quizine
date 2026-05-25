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
  showCta: boolean
  localStoragePrefix: string
  showEkg: boolean
  ctaUrl: string
  ctaLabel: string
  questionsTable: string
  storyButtonText: string
  disabled?: boolean
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
    showBackLink: true,
    showCta: false,
    localStoragePrefix: 'dq_',
    showEkg: false,
    ctaUrl: 'https://quizine.se',
    ctaLabel: '⚔️ Vill du spela mer? Besök Quizine.se',
    questionsTable: 'remote_questions',
    storyButtonText: '🍽️  Berätta en kroghistoria',
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
    showStoryButton: true,
    showBackLink: true,
    showCta: true,
    localStoragePrefix: 'voo_',
    showEkg: true,
    ctaUrl: 'https://quizine.se',
    ctaLabel: '🩺 Vill du spela mer? Besök quizine.se',
    questionsTable: 'voo_remote_questions',
    storyButtonText: '🏥 Berätta en arbetsrelaterad händelse',
  },
  blaljus: {
    id: 'blaljus',
    name: 'Quizine Daily',
    subtitle: 'Blåljuspersonal',
    icon: '🚨',
    heroLine1: 'Dagens',
    heroLine2Start: '',
    heroEm: 'utryckningsfrågor.',
    heroCopyLine1: 'Visa vad du kan om livet under blåljuset.',
    heroCopyLine2: 'Tävla med dina kollegor.',
    cardTitle: 'Dagens förhör',
    cardIcon: '🚨',
    startBtnIcon: '🚨',
    showStoryButton: true,
    showBackLink: true,
    showCta: true,
    localStoragePrefix: 'blaljus_',
    showEkg: false,
    ctaUrl: 'https://quizine.se',
    ctaLabel: '🚨 Vill du spela mer? Besök quizine.se',
    questionsTable: 'blaljus_remote_questions',
    storyButtonText: '🚨 Berätta en historia',
  },
  it: {
    id: 'it',
    name: 'Quizine Daily',
    subtitle: 'IT & Software',
    icon: '💻',
    heroLine1: 'Dagens quiz',
    heroLine2Start: 'är ',
    heroEm: 'deployat.',
    heroCopyLine1: 'Visa vad du kan om IT och mjukvara.',
    heroCopyLine2: 'Tävla med kollegorna.',
    cardTitle: 'Dagens sprint',
    cardIcon: '💻',
    startBtnIcon: '💻',
    showStoryButton: true,
    showBackLink: true,
    showCta: true,
    localStoragePrefix: 'it_',
    showEkg: false,
    ctaUrl: 'https://quizine.se',
    ctaLabel: '💻 Vill du spela mer? Besök quizine.se',
    questionsTable: 'it_remote_questions',
    storyButtonText: '💻  Berätta en arbetsrelaterad händelse',
  },
  it: {
    id: 'it',
    name: 'Quizine Daily',
    subtitle: 'IT & Software',
    icon: '💻',
    heroLine1: 'Dagens quiz',
    heroLine2Start: 'är ',
    heroEm: 'deployat.',
    heroCopyLine1: 'Visa vad du kan om IT och mjukvara.',
    heroCopyLine2: 'Tävla med kollegorna.',
    cardTitle: 'Dagens sprint',
    cardIcon: '💻',
    startBtnIcon: '💻',
    showStoryButton: true,
    showBackLink: true,
    localStoragePrefix: 'it_',
    showEkg: false,
    ctaUrl: 'https://quizine.se',
    ctaLabel: '💻 Vill du spela mer? Besök quizine.se',
  },
}

export function getSegmentConfig(): SegmentConfig {
  return CONFIGS[SEGMENT] ?? CONFIGS.quizine
}
