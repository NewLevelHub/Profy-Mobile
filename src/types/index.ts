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
