import type { EventDefinition, EventSlug } from './types';

const DEFAULT_MAX_TEAMS = Number(process.env.NEXT_PUBLIC_EVENT_MAX_TEAMS ?? 60);

export const summitHighlights = {
  prizePool: '₹2,00,000',
  tagline: 'Innovation, leadership, and entrepreneurial excellence under one roof.'
};

export const eventDefinitions: EventDefinition[] = [
  {
    slug: 'ideathon',
    shortCode: 'IDE',
    name: 'Ideathon',
    description:
      'A platform for innovators to present groundbreaking startup ideas addressing real-world problems with scalable solutions.',
    fee: '₹700',
    maxTeams: DEFAULT_MAX_TEAMS,
    teamSize: '3–4',
    minParticipants: 3,
    maxParticipants: 4,
    category: 'Innovation'
  },
  {
    slug: 'fusion-x',
    shortCode: 'FUS',
    name: 'Fusion X',
    description:
      'Combine three or more existing business models to create a unique and innovative startup concept.',
    fee: '₹700',
    maxTeams: DEFAULT_MAX_TEAMS,
    teamSize: '3–4',
    minParticipants: 3,
    maxParticipants: 4,
    category: 'Strategy'
  },
  {
    slug: 'case-study',
    shortCode: 'CAS',
    name: 'Case Study Poster',
    description:
      'Analyze a real-world business problem and present your solution creatively through a structured poster.',
    fee: '₹700',
    maxTeams: DEFAULT_MAX_TEAMS,
    teamSize: '3–4',
    minParticipants: 3,
    maxParticipants: 4,
    category: 'Analysis'
  },
  {
    slug: 'quiz',
    shortCode: 'QIZ',
    name: 'Quiz',
    description: 'Test your entrepreneurial knowledge through a competitive and engaging quiz.',
    fee: '₹400',
    maxTeams: DEFAULT_MAX_TEAMS,
    teamSize: '2',
    minParticipants: 2,
    maxParticipants: 2,
    category: 'Competition'
  },
  {
    slug: 'elocution',
    shortCode: 'ELO',
    name: 'Elocution',
    description:
      'Express your ideas on entrepreneurship, leadership, and innovation through impactful speaking.',
    fee: '₹400',
    maxTeams: DEFAULT_MAX_TEAMS,
    teamSize: '2',
    minParticipants: 2,
    maxParticipants: 2,
    category: 'Expression'
  },
  {
    slug: 'speaker-session',
    shortCode: 'SPS',
    name: 'Speaker Session',
    description:
      'Prominent entrepreneurs from across Karnataka will be present as guest speakers along with engaging panel discussions.',
    fee: '₹100 per participant',
    maxTeams: 250,
    teamSize: '3 students + 1 faculty (optional)',
    minParticipants: 3,
    maxParticipants: 4,
    category: 'Talk',
    featured: true
  }
];

export const eventBySlug = (slug: EventSlug) => eventDefinitions.find((item) => item.slug === slug);
