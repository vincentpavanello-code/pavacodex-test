// Types principaux pour FormaTech CRM

// ==================== ENUMS ====================

export type DealStage =
  | 'lead_entrant'
  | 'qualification'
  | 'demo_rdv'
  | 'proposition'
  | 'negociation'
  | 'gagne'
  | 'perdu';

export type LeadSource =
  | 'site_web'
  | 'linkedin'
  | 'recommandation'
  | 'salon'
  | 'appel_entrant'
  | 'autre';

export type OfferType = 'starter' | 'advanced' | 'enterprise';

export type CompanySize = 'tpe' | 'pme' | 'eti' | 'ge';

export type Sector =
  | 'industrie'
  | 'services'
  | 'commerce'
  | 'tech'
  | 'finance'
  | 'sante'
  | 'public'
  | 'autre';

export type Timing = 'moins_3_mois' | '3_6_mois' | 'plus_6_mois' | 'flou';

export type PaymentMode = 'virement' | 'cb' | 'cheque';

export type PaymentTerms = '30_jours' | '45_jours' | '60_jours' | 'comptant';

export type LossReason =
  | 'prix_eleve'
  | 'concurrent'
  | 'projet_reporte'
  | 'projet_annule'
  | 'pas_reponse'
  | 'besoin_mal_qualifie'
  | 'autre';

export type DiscountReason =
  | 'volume'
  | 'fidelite'
  | 'concurrence'
  | 'timing'
  | 'autre';

export type ActivityType =
  | 'appel'
  | 'email'
  | 'rdv'
  | 'note'
  | 'changement_etape'
  | 'modification';

export type ReminderType =
  | 'lead_a_qualifier'
  | 'lead_froid'
  | 'deal_dormant'
  | 'relance_propale'
  | 'propale_expiree'
  | 'nego_longue'
  | 'alerte_formation';

export type OPCO =
  | 'afdas'
  | 'akto'
  | 'atlas'
  | 'constructys'
  | 'ep'
  | 'mobilites'
  | 'ocapiat'
  | 'opco2i'
  | 'opcommerce'
  | 'sante'
  | 'uniformation';

// ==================== INTERFACES ====================

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'commercial' | 'manager';
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  siren: string;
  sector: Sector;
  size: CompanySize;
  address: string;
  city: string;
  postalCode: string;
  website?: string;
  estimatedRevenue?: number;
  collectiveAgreement?: string;
  opco?: OPCO;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  civility: 'M.' | 'Mme';
  firstName: string;
  lastName: string;
  function: string;
  email: string;
  phoneFixed?: string;
  phoneMobile?: string;
  linkedinUrl?: string;
  isDecisionMaker: 'oui' | 'non' | 'a_confirmer';
  isSignatory: boolean;
  companyId: string;
  company?: Company;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualificationScore {
  budgetIdentified: number; // 1-5
  decisionMakerIdentified: number; // 1-5
  timing: Timing;
  timingScore: number; // 1-5
  realNeedExpressed: number; // 1-5
  companySize: CompanySize;
  companySizeScore: number; // 1-5
  totalScore: number; // calculated
}

export interface DemoMeeting {
  date: string;
  participants: string;
  duration: number; // minutes
  clientContext: string;
  needsExpressed: string;
  objectionsRaised: string;
  nextSteps: string;
  decisionMakerPresent: boolean;
}

export interface Proposal {
  sentDate: string;
  offerType: OfferType;
  amount: number;
  participantsCount: number;
  proposedDates: string;
  validityDays: number;
  pdfPath?: string;
}

export interface NegotiationEntry {
  id: string;
  date: string;
  content: string;
}

export interface Negotiation {
  entries: NegotiationEntry[];
  revisedAmount?: number;
  discountPercent?: number;
  discountReason?: DiscountReason;
}

export interface Won {
  signatureDate: string;
  finalAmount: number;
  paymentMode: PaymentMode;
  paymentTerms: PaymentTerms;
  purchaseOrderNumber?: string;
  confirmedTrainingDates: string;
}

export interface Lost {
  reason: LossReason;
  competitorName?: string;
  otherReason?: string;
  recontactIn6Months: boolean;
  lessonsLearned?: string;
}

export interface Deal {
  id: string;
  companyId: string;
  company?: Company;
  contactId: string;
  contact?: Contact;
  userId: string;
  user?: User;
  stage: DealStage;

  // Stage 1: Lead entrant
  source: LeadSource;
  sourceDetails?: string;
  howDidTheyFindUs?: string;
  entryDate: string;

  // Stage 2: Qualification
  qualification?: QualificationScore;

  // Stage 3: Demo/RDV
  demoMeeting?: DemoMeeting;

  // Stage 4: Proposition
  proposal?: Proposal;

  // Stage 5: Négociation
  negotiation?: Negotiation;

  // Stage 6: Gagné
  won?: Won;

  // Stage 7: Perdu
  lost?: Lost;

  // Computed fields
  currentAmount: number;
  expectedCloseDate?: string;

  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export interface Activity {
  id: string;
  dealId: string;
  userId: string;
  user?: User;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Reminder {
  id: string;
  dealId: string;
  deal?: Deal;
  type: ReminderType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ==================== STATS & DASHBOARD ====================

export interface DashboardStats {
  totalPipeline: number;
  dealsByStage: Record<DealStage, { count: number; amount: number }>;
  forecastThisMonth: number;
  signedThisMonth: number;
  signedLastMonth: number;
  conversionRate90Days: number;
}

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

export interface SourceDistribution {
  source: LeadSource;
  count: number;
}

export interface UserPerformance {
  userId: string;
  userName: string;
  dealsCount: number;
  pipelineAmount: number;
  signedAmount: number;
  conversionRate: number;
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== FORM DATA ====================

export interface DealFormData {
  companyId: string;
  contactId: string;
  userId: string;
  source: LeadSource;
  sourceDetails?: string;
  howDidTheyFindUs?: string;
  expectedCloseDate?: string;
}

export interface CompanyFormData {
  name: string;
  siren: string;
  sector: Sector;
  size: CompanySize;
  address: string;
  city: string;
  postalCode: string;
  website?: string;
  estimatedRevenue?: number;
  collectiveAgreement?: string;
  opco?: OPCO;
}

export interface ContactFormData {
  civility: 'M.' | 'Mme';
  firstName: string;
  lastName: string;
  function: string;
  email: string;
  phoneFixed?: string;
  phoneMobile?: string;
  linkedinUrl?: string;
  isDecisionMaker: 'oui' | 'non' | 'a_confirmer';
  isSignatory: boolean;
  companyId: string;
  notes?: string;
}

// ==================== CONSTANTS ====================

export const OFFER_PRICES: Record<OfferType, { min: number; max: number; participants: number }> = {
  starter: { min: 1500, max: 1500, participants: 10 },
  advanced: { min: 3500, max: 3500, participants: 12 },
  enterprise: { min: 8000, max: 15000, participants: 15 }
};

export const STAGE_LABELS: Record<DealStage, string> = {
  lead_entrant: 'Lead Entrant',
  qualification: 'Qualification',
  demo_rdv: 'Démo/RDV Découverte',
  proposition: 'Proposition Envoyée',
  negociation: 'Négociation',
  gagne: 'Gagné',
  perdu: 'Perdu'
};

export const STAGE_ORDER: DealStage[] = [
  'lead_entrant',
  'qualification',
  'demo_rdv',
  'proposition',
  'negociation',
  'gagne'
];

export const SOURCE_LABELS: Record<LeadSource, string> = {
  site_web: 'Site web',
  linkedin: 'LinkedIn',
  recommandation: 'Recommandation',
  salon: 'Salon',
  appel_entrant: 'Appel entrant',
  autre: 'Autre'
};

export const SECTOR_LABELS: Record<Sector, string> = {
  industrie: 'Industrie',
  services: 'Services',
  commerce: 'Commerce',
  tech: 'Tech',
  finance: 'Finance',
  sante: 'Santé',
  public: 'Public',
  autre: 'Autre'
};

export const SIZE_LABELS: Record<CompanySize, string> = {
  tpe: 'TPE (<10)',
  pme: 'PME (10-250)',
  eti: 'ETI (250-5000)',
  ge: 'GE (>5000)'
};

export const OPCO_LABELS: Record<OPCO, string> = {
  afdas: 'AFDAS',
  akto: 'AKTO',
  atlas: 'Atlas',
  constructys: 'Constructys',
  ep: 'Entreprises de proximité',
  mobilites: 'Mobilités',
  ocapiat: 'OCAPIAT',
  opco2i: 'OPCO 2i',
  opcommerce: 'OPCOMMERCE',
  sante: 'Santé',
  uniformation: 'Uniformation'
};

export const OFFER_LABELS: Record<OfferType, string> = {
  starter: 'Starter (1 jour - 1500€)',
  advanced: 'Advanced (2 jours - 3500€)',
  enterprise: 'Enterprise (3-5 jours - 8000-15000€)'
};

export const TIMING_LABELS: Record<Timing, string> = {
  moins_3_mois: 'Moins de 3 mois',
  '3_6_mois': '3 à 6 mois',
  plus_6_mois: 'Plus de 6 mois',
  flou: 'Flou'
};
