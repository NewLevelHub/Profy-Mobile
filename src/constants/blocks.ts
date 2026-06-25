import type { AssessmentBlock } from '../types';

export const ALL_BLOCKS: AssessmentBlock[] = [
  'interests',
  'thinking',
  'personality',
  'motivation',
  'academic',
  'directions',
  'goal_clarification',
  'university',
];

export const BLOCK_NAMES: Record<AssessmentBlock, string> = {
  interests: 'Интересы',
  thinking: 'Стиль мышления',
  personality: 'Личность',
  motivation: 'Мотивация',
  academic: 'Учебные склонности',
  directions: 'Направления',
  goal_clarification: 'Твоя цель',
  university: 'Университет',
};

export const BLOCK_EMOJIS: Record<AssessmentBlock, string> = {
  interests: '✨',
  thinking: '🧩',
  personality: '🦋',
  motivation: '🚀',
  academic: '📚',
  directions: '🧭',
  goal_clarification: '🎯',
  university: '🎓',
};

export const BLOCK_DESCRIPTIONS: Record<AssessmentBlock, string> = {
  interests: 'Узнаем, что тебя по-настоящему интересует',
  thinking: 'Разберёмся, как ты думаешь и решаешь задачи',
  personality: 'Поймём твои сильные стороны характера',
  motivation: 'Выясним, что тебя вдохновляет и движет',
  academic: 'Посмотрим, какие предметы тебе ближе всего',
  directions: 'Определим подходящие профессиональные пути',
  goal_clarification: 'Уточним твою главную цель',
  university: 'Подберём университеты под твой профиль',
};
