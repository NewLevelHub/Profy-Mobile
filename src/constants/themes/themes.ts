/**
 * themes.ts — единый источник стиля приложения Profy
 * ---------------------------------------------------------------------------
 * Собран из дизайн-референса (коралловая тема, шрифт Nunito).
 * Цель: наследовать токены отсюда, а НЕ хардкодить цвета по компонентам.
 *
 * Все производные оттенки (soft / ghost / deep / glow) выписаны конкретными
 * hex-значениями — React Native не поддерживает CSS color-mix.
 *
 * Шрифт: Nunito (округлый дружелюбный гротеск).
 *   expo install @expo-google-fonts/nunito expo-font
 *   import {
 *     useFonts,
 *     Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold,
 *     Nunito_700Bold, Nunito_800ExtraBold, Nunito_900Black,
 *   } from '@expo-google-fonts/nunito';
 * ---------------------------------------------------------------------------
 */

// ===========================================================================
// COLORS
// ===========================================================================

export const colors = {
  // — Акцент (коралл) ————————————————————————————————————————————————
  primary: '#FF6A3D',        // основной акцент: кнопки, активные элементы
  primarySoft: '#FFE7DC',    // фон выбранных элементов / soft-плашки
  primaryGhost: '#FFF4EF',   // очень светлый фон карточек/подложек
  primaryDeep: '#B5462A',    // текст/иконки поверх soft-фона, pressed-состояние
  primaryDisabled: '#FFB59E',// неактивная кнопка (бывш. лиловый #A5B4FC)
  primaryGlow: 'rgba(255,106,61,0.32)', // цвет тени/свечения акцента

  // — Дополнительные акценты ————————————————————————————————————————
  accent: '#FFB23E',         // тёплый янтарь: конфетти, второстепенные акценты
  ok: '#33B27D',             // успех / положительные подтверждения
  danger: '#EF4444',         // ошибки (сохранён из исходной палитры)

  // — Текст ——————————————————————————————————————————————————————————
  text: '#2E211B',           // заголовки, основной тёмный текст
  textSecondary: '#7E6E64',  // вторичный текст, описания
  textMuted: '#BBAA9F',      // неактивный / приглушённый текст, заглушки

  // — Поверхности и фоны ————————————————————————————————————————————
  bg: '#FFF8F3',             // основной фон экранов (тёплый кремовый)
  surface: '#FFFFFF',        // карточки, плашки, нижняя навигация
  white: '#FFFFFF',

  // — Линии и состояния ————————————————————————————————————————————
  border: '#EFE2D8',         // бордеры инпутов / карточек
  track: '#F2E5DB',          // трек прогресса, заблокированные узлы роадмапа
  overlay: 'rgba(0,0,0,0.45)', // полупрозрачный фон под модальными окнами

  // Текст поверх акцентной заливки (например, на primary-кнопке/hero-карточке)
  onPrimary: '#FFFFFF',
} as const;

/**
 * Карта миграции со старой indigo-палитры → новые токены.
 * Используйте для find-and-replace по компонентам:
 *
 *   #4F46E5  →  colors.primary
 *   #EEF2FF  →  colors.primarySoft
 *   #A5B4FC  →  colors.primaryDisabled
 *   #EF4444  →  colors.danger
 *   #111827  →  colors.text
 *   #374151 / #6B7280  →  colors.textSecondary
 *   #9CA3AF  →  colors.textMuted
 *   #D1D5DB / #E5E7EB  →  colors.border
 *   #F9FAFB / #F3F4F6  →  colors.bg / colors.surface
 *   #FFFFFF  →  colors.surface
 */

// ===========================================================================
// TYPOGRAPHY  (Nunito)
// ===========================================================================

export const fontFamily = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const fontSize = {
  display: 30,   // экран-приветствие, заголовки празднования
  h1: 27,        // заголовки экранов
  title: 22,     // крупные секции
  subtitle: 19,  // вопрос в тесте, подзаголовки
  body: 16,      // основной текст
  label: 15,     // подписи карточек, кнопки
  caption: 13,   // вторичные подписи
  small: 12,     // мелкие подписи (таб-бар, метки)
  tiny: 11,      // hex/служебные подписи
} as const;

/**
 * Готовые текстовые пресеты — раскладывайте в StyleSheet через ...typography.xxx
 * letterSpacing для крупных заголовков слегка отрицательный (плотнее).
 */
export const typography = {
  display: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.display,
    lineHeight: 33,
    letterSpacing: -0.5,
    color: colors.text,
  },
  h1: {
    fontFamily: fontFamily.black,
    fontSize: fontSize.h1,
    lineHeight: 30,
    letterSpacing: -0.5,
    color: colors.text,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.title,
    lineHeight: 27,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.subtitle,
    lineHeight: 24,
    color: colors.text,
  },
  body: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.body,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  bodyStrong: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.body,
    lineHeight: 23,
    color: colors.text,
  },
  label: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.label,
    lineHeight: 20,
    color: colors.text,
  },
  caption: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.caption,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  small: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.small,
    lineHeight: 16,
    color: colors.textSecondary,
  },
} as const;

// ===========================================================================
// SPACING  (шаг 4)
// ===========================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  screenH: 20,   // горизонтальный отступ экрана
  screenV: 22,   // вертикальный отступ экрана
} as const;

// ===========================================================================
// RADII
// ===========================================================================

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,    // основной радиус карточек (стиль "Rounded")
  pill: 999, // кнопки-пилюли, чипы, прогресс-трек
} as const;

/** Варианты скругления из референса (твик cornerStyle). */
export const cornerStyles = {
  Rounded: { card: 22, pill: 999 },
  Soft: { card: 16, pill: 12 },
  Sharp: { card: 10, pill: 8 },
} as const;

// ===========================================================================
// SHADOWS  (React Native: iOS shadow* + Android elevation)
// ===========================================================================

export const shadows = {
  /** Объёмная "тактильная" кнопка: глубина снизу + мягкое свечение акцента. */
  button: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  /** Карточка на фоне экрана. */
  card: {
    shadowColor: '#1E140C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
} as const;

// ===========================================================================
// AGGREGATE THEME
// ===========================================================================

export const theme = {
  colors,
  fontFamily,
  fontSize,
  typography,
  spacing,
  radii,
  cornerStyles,
  shadows,
} as const;

export type Theme = typeof theme;
export type Colors = typeof colors;

export default theme;
