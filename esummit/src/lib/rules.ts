import type { EventSlug } from './types';

type RulesDownloadConfig = {
  slug: EventSlug;
  label: string;
  available: boolean;
  disabledReason?: string;
  fileCandidates: string[];
};

const rulesDownloadConfig: Record<EventSlug, RulesDownloadConfig> = {
  ideathon: {
    slug: 'ideathon',
    label: 'Download Rules PDF',
    available: true,
    fileCandidates: ['Ideathon X.pdf']
  },
  'fusion-x': {
    slug: 'fusion-x',
    label: 'Download Rules PDF',
    available: true,
    fileCandidates: ['Fusion X.pdf']
  },
  'case-study': {
    slug: 'case-study',
    label: 'Download Rules PDF',
    available: true,
    fileCandidates: ['Case Study.pdf']
  },
  quiz: {
    slug: 'quiz',
    label: 'Download Rules PDF',
    available: true,
    fileCandidates: ['Quiz X.pdf']
  },
  elocution: {
    slug: 'elocution',
    label: 'Download Rules PDF',
    available: true,
    fileCandidates: ['elocution_rules.pdf']
  },
  'speaker-session': {
    slug: 'speaker-session',
    label: 'Download Rules PDF',
    available: false,
    disabledReason: 'Rules download is disabled for now.',
    fileCandidates: ['speaker-session.pdf', 'speaker-session.docx', 'speaker_session.pdf', 'speaker_session.docx']
  }
};

export function getRulesDownloadConfig(slug: EventSlug) {
  return rulesDownloadConfig[slug];
}
