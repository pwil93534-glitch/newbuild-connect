export type BuyerType = 'veteran' | 'first_time' | 'relocation' | 'senior';
export type MilitaryBase = 'luke' | 'huachuca' | 'dm' | 'veteran_retired';
export type LoanType = 'va' | 'fha' | 'conventional' | 'unsure';
export type Timeline = 'asap' | '1_3mo' | '3_6mo' | '6_12mo' | 'exploring';
export type JourneyStatus = 'not_started' | 'in_progress' | 'complete' | 'needs_attention';

export interface Buyer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email: string;
  buyer_type: BuyerType;
  military_base?: MilitaryBase;
  budget_min: number;
  budget_max: number;
  timeline: Timeline;
  loan_type: LoanType;
  current_stage: number;
  created_at: string;
}

export interface JourneyStage {
  id: string;
  buyer_id: string;
  stage_number: number;
  stage_name: string;
  status: JourneyStatus;
  started_at?: string;
  completed_at?: string;
}

export interface JourneyTask {
  id: string;
  buyer_id: string;
  stage_number: number;
  task_text: string;
  is_complete: boolean;
  completed_at?: string;
}

export interface Community {
  id: string;
  name: string;
  builder: string;
  city: string;
  area: 'phoenix' | 'tucson';
  priceFrom: number;
  priceTo: number;
  base?: MilitaryBase | null;
  distanceFromBase?: number | null;
  vaEligible: boolean;
  fhaEligible: boolean;
  seniorCommunity: boolean;
  amenities: string[];
  activeIncentives: string[];
  tags: string[];
  color: string;
}

export interface Incentive {
  id: string;
  name: string;
  category: 'va_loan' | 'state_benefit' | 'state_program' | 'local_program' | 'builder_incentive';
  value: string;
  valueNumeric: number | null;
  description: string;
  eligibility: BuyerType[];
  expiration: string | null;
  stackable: boolean;
  source: string;
  builderSpecific?: string;
  areasApplicable?: string[];
}

export interface AIMessage {
  id: string;
  buyer_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface NotificationPrefs {
  buyer_id: string;
  incentive_alerts: boolean;
  journey_nudges: boolean;
  community_alerts: boolean;
  deadline_warnings: boolean;
  market_updates: boolean;
  agent_checkins: boolean;
}

export interface JourneyStageDefinition {
  number: number;
  name: string;
  description: string;
  icon: string;
  estimatedDays: number;
  tasks: JourneyTaskDefinition[];
  agentTip: string;
  documentsNeeded?: string[];
}

export interface JourneyTaskDefinition {
  text: string;
  detail: string;
  why: string;
  how: string;
  agentNote: string;
}

export type SignalQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'none';
export type ConnectionType = 'wifi' | 'cellular' | 'none' | 'unknown';

export interface SignalCheckResult {
  quality: SignalQuality;
  connectionType: ConnectionType;
  isInternetReachable: boolean;
  latencyMs: number | null;
  checkedAt: string;
}
