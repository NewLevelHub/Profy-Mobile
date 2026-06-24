// ─── University / Gap-analysis domain ─────────────────────────────────────────

export interface UniversityBrief {
  id: string;
  name: string;
  country: string;
  city: string;
  website: string | null;
  ranking: number | null;
}

export interface ProgramBrief {
  id: string;
  name: string;
  direction_slug: string;
  language: string;
  cost_per_year: number | null;
  description: string | null;
  university: UniversityBrief;
}

export interface ProgramDetail extends ProgramBrief {
  who_its_for: string | null;
  career_options: unknown[];
  requirements: Record<string, unknown>;
  deadlines: Record<string, unknown>;
  grants: unknown[];
  created_at: string;
}

export type GapStatus = 'met' | 'not_met' | 'in_progress' | 'unknown';

export interface GapItem {
  requirement: string;
  status: GapStatus;
  comment: string;
}

export interface GapAnalysisResponse {
  program_id: string;
  met: GapItem[];
  not_met: GapItem[];
  in_progress: GapItem[];
  unknown: GapItem[];
  readiness_score: number;
}

// ──────────────────────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type PraiseNextScreen = 'ArtifactsSetup' | 'GoalSelection' | 'Home';

export type AppStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  ArtifactsSetup: undefined;
  GoalSelection: undefined;
  Assessment: undefined;
  Home: undefined;
  Praise: { title: string; subtitle?: string; nextScreen: PraiseNextScreen };
  ResultLoading: { assessmentId: string };
  Result: undefined;
  DirectionDetail: { direction: DirectionResult };
  UniversityList: { directionSlug: string };
  ProgramDetail: { programId: string; programName: string; universityName: string };
  GapAnalysis: { programId: string; assessmentId: string; programName: string; universityName: string };
  Roadmap: { assessmentId: string };
};

export type AssessmentGoal = 'explore' | 'profession' | 'university';
export type AssessmentStatus = 'in_progress' | 'completed';

export interface AssessmentResponse {
  id: string;
  goal: AssessmentGoal;
  status: AssessmentStatus;
  current_block: number;
  created_at: string;
}

export type ArtifactType = 'hobby' | 'club' | 'sport' | 'achievement' | 'goal' | 'book' | 'game' | 'topic' | 'profession' | 'university' | 'dream';

export interface ArtifactItem {
  type: ArtifactType;
  value: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface TokenResponse {
  access_token: string;
  user: User;
}

export type AgeGroup = 'junior' | 'middle' | 'senior';

export type AssessmentBlock =
  | 'interests'
  | 'thinking'
  | 'personality'
  | 'motivation'
  | 'academic'
  | 'directions'
  | 'goal_clarification'
  | 'university';

export interface QuestionOption {
  text: string;
  index: number;
}

export interface Question {
  id: string;
  block: AssessmentBlock;
  text: string;
  options: QuestionOption[];
}

export interface AnswerPayload {
  question_id: string;
  selected_option_index: number;
}

export interface SaveAnswersPayload {
  block: AssessmentBlock;
  answers: AnswerPayload[];
}

export interface SaveAnswersResponse {
  block: AssessmentBlock;
  scores: Record<string, number>;
}

export interface ReportResponse {
  id: string;
  assessment_id: string;
}

export interface DirectionResult {
  slug: string;
  name: string;
  match_score: number;
  why_it_fits: string;
  description: string;
  professions: string[];
  skills_needed: string[];
  subjects_to_develop: string[];
  first_steps: string[];
}

export interface AnalysisResultResponse {
  id: string;
  assessment_id: string;
  summary: string;
  strengths: string[];
  interests_map: Record<string, number>;
  thinking_style: Record<string, number>;
  motivation: string[];
  directions: DirectionResult[];
  created_at: string;
}

export interface ProfilePayload {
  name: string;
  age: number;
  grade: number;
  city: string;
  country: string;
  language: string;
  subjects_like: string[];
  subjects_dislike: string[];
  subjects_easy: string[];
  subjects_hard: string[];
}

export interface ProfileResponse extends ProfilePayload {
  id: string;
  user_id: string;
  age_group: AgeGroup;
}
