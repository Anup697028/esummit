export type EventSlug = 'ideathon' | 'fusion-x' | 'case-study' | 'quiz' | 'elocution' | 'speaker-session';

export type EventDefinition = {
  slug: EventSlug;
  shortCode: string;
  name: string;
  description: string;
  fee: string;
  maxTeams: number;
  teamSize: string;
  minParticipants: number;
  maxParticipants: number;
  category: string;
  featured?: boolean;
};

export type RegistrationParticipant = {
  name: string;
  usn?: string;
};

export type RegistrationRecord = {
  registration_id: string;
  event: EventSlug;
  team_name: string;
  team_name_normalized?: string;
  team_leader_name: string;
  participants: RegistrationParticipant[];
  email: string;
  email_normalized?: string;
  phone: string;
  college: string;
  semester: string;
  transaction_id: string;
  screenshot_url: string;
  status: 'Pending Verification' | 'Approved' | 'Rejected';
  rejection_reason?: string;
  rejectedAt?: string;
  notified?: boolean;
  notifiedAt?: string;
  createdAt: string;
};
