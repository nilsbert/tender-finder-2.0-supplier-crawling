export type BidDecisionType = 'bid' | 'no_bid' | 'defer' | 'needs_info';

export type ReasonCode =
  | 'scope_mismatch'
  | 'timing_constraints'
  | 'budget_limitations'
  | 'strategic_fit'
  | 'resource_availability'
  | 'geographic_constraints'
  | 'technical_capabilities'
  | 'compliance_requirements';

export interface BidDecisionEvent {
  id: string;
  internal_id: string;
  decision: BidDecisionType;
  person?: string;
  justification?: string;
  created_at: string;
}

export interface BidDecisionFull {
  id: string;
  tender_id: string;
  decision: BidDecisionType;
  reason_codes: ReasonCode[];
  notes?: string;
  decided_by?: string;
  decided_at: string;
  created_at: string;
}

export interface BidDecisionCreate {
  tender_id: string;
  decision: BidDecisionType;
  reason_codes: ReasonCode[];
  notes?: string;
  decided_by?: string;
}

export interface Person {
  first_name?: string;
  last_name?: string;
  email: string;
  department?: string;
}

export interface TenderOwnership {
  tender_id: string;
  status: 'UNCLAIMED' | 'CLAIMED';
  driver?: Person | null;
  co_drivers: Person[];
  claimed_at?: string | null;
  released_at?: string | null;
  updated_at?: string;
}

export interface TenderComment {
  id: string;
  tender_id: string;
  author: Person;
  body: string;
  created_at: string;
}

// Human-readable labels for decision types
export const DECISION_LABELS: Record<BidDecisionType, string> = {
  bid: 'Bid',
  no_bid: 'No Bid',
  defer: 'Defer',
  needs_info: 'Needs Info',
};

// Human-readable labels for reason codes
export const REASON_CODE_LABELS: Record<ReasonCode, string> = {
  scope_mismatch: 'Scope Mismatch',
  timing_constraints: 'Timing Constraints',
  budget_limitations: 'Budget Limitations',
  strategic_fit: 'Strategic Fit',
  resource_availability: 'Resource Availability',
  geographic_constraints: 'Geographic Constraints',
  technical_capabilities: 'Technical Capabilities',
  compliance_requirements: 'Compliance Requirements',
};
