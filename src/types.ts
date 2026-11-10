export type VisitCategory = 'Pregnancy' | 'Newborn' | 'Immunisation' | 'Follow-up' | 'General';

export interface Beneficiary {
  id: string;
  name: string;
  age: number;
  village: string;
  ward: string;
  category: VisitCategory;
  phone: string;
  lastVisitDate: string;
  nextScheduledDate: string;
  status: 'Normal' | 'High Risk' | 'Overdue' | 'Due Today';
  gestationalMonth?: string;
  babyAge?: string;
  dangerFlag?: boolean;
}

export interface DangerSignItem {
  type: 'MATERNAL' | 'NEWBORN';
  sign: string;
  guidelineCategory: string;
  severity: 'EMERGENCY' | 'WARNING';
  actionRequired: string;
}

export interface VisitInfo {
  beneficiaryId: string;
  beneficiaryName: string;
  village: string;
  visitDate: string;
  visitType: string;
}

export interface PregnancyInfo {
  pregnancyMonth: string;
  ancCheckupStatus: string;
  bloodPressure: string;
  ttVaccineStatus: string;
  ifaTabletStatus: string;
  observations: string;
}

export interface NewbornInfo {
  babyName: string;
  babyAge: string;
  birthWeight: string;
  currentWeight: string;
  breastfeedingStatus: string;
  observations: string;
}

export interface ImmunisationInfo {
  vaccineName: string;
  vaccinationStatus: string;
  vaccinationDueDate: string;
}

export interface FollowUpInfo {
  nextVisitDate: string;
  nextVisitDays: string;
  pendingVaccination: string;
  pendingCheckup: string;
  otherActions: string;
}

export interface StructuredRecord {
  id: string;
  timestamp: string;
  visitInfo: VisitInfo;
  pregnancyInfo: PregnancyInfo;
  newbornInfo: NewbornInfo;
  immunisationInfo: ImmunisationInfo;
  followUp: FollowUpInfo;
  dangerSigns: DangerSignItem[];
  isEmergency: boolean;
  emergencyAlertMessage?: string;
  spokenSummary: string;
  originalTranscript: string;
  confirmed: boolean;
  confidence?: {
    score: number;
    uncertainFields: string[];
    clarificationQuestion?: string;
  };
}

export interface FollowUpTask {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  title: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'EMERGENCY' | 'HIGH' | 'NORMAL';
  actionType: 'PHC_REFERRAL' | 'HOME_VISIT' | 'MEDICATION_CHECK' | 'VACCINATION';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  speechCode: string;
}

export interface DemoScenario {
  id: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C';
  title: string;
  category: string;
  beneficiary: string;
  beneficiaryId: string;
  badge: string;
  description: string;
  transcript: string;
}

export type VoicePersona = 'woman' | 'child';

export interface AshaUser {
  id: string;
  name: string;
  role: 'ASHA Worker' | 'ASHA Facilitator' | 'ANM Supervisor';
  ashaId: string;
  phone: string;
  subCentre: string;
  phcName: string;
  district: string;
  avatarUrl?: string;
  assignedHouseholds: number;
}
