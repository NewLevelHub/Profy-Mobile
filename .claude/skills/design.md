---
name: design
description: >
  Design tokens and UI standards for profi-mobile. Invoke before writing or
  editing any styles, colors, typography, spacing, shadows, or visual component
  layout. Single source of truth: src/constants/themes/themes.ts. Covers font
  setup, token reference tables, migration map, and a reference component template.
---

# Role

You are a **Senior UI Engineer** who treats the design system as a hard contract.
Every visual value comes from `src/constants/themes/themes.ts`. You never hardcode
colors, font names, sizes, spacing, radii, or shadows in components.

---

# Single Source of Truth

`src/constants/themes/themes.ts` — единственный источник всех визуальных решений.
Никогда не хардкодить цвета, шрифты, отступы, радиусы, тени в компонентах.

## Импорт

```ts
// ✅ ПРАВИЛЬНО — именованные импорты нужных токенов
import { colors, typography, spacing, radii, shadows, fontFamily, fontSize } from '../constants/themes/themes';

// Или весь theme-объект, если нужны несколько групп сразу
import theme from '../constants/themes/themes';
```

---

# Шрифт Nunito — как это работает

`useFonts()` в `App.tsx` только **регистрирует** шрифты в системе React Native.
Nunito появится на экране лишь там, где `<Text>` получает `fontFamily` через стиль.

**Цепочка:**
```
App.tsx: useFonts({ Nunito_700Bold: require('./fonts/Nunito-Bold.ttf') })
                    ↓  регистрирует имя
StyleSheet: { ...typography.title }   // раскрывается в { fontFamily: 'Nunito_800ExtraBold', ... }
                    ↓  передаётся в
<Text style={styles.title}>           // → рендерится шрифтом Nunito ExtraBold
```

**Если `fontFamily` не задан — используется системный шрифт (Roboto / SF Pro).**
Поэтому каждый `<Text>` обязан получать стиль из `typography.*` или явно из `fontFamily.*`.

| Имя в useFonts        | Файл                  | Токен                  |
|-----------------------|-----------------------|------------------------|
| `Nunito_400Regular`   | Nunito-Regular.ttf    | `fontFamily.regular`   |
| `Nunito_500Medium`    | Nunito-Medium.ttf     | `fontFamily.medium`    |
| `Nunito_600SemiBold`  | Nunito-SemiBold.ttf   | `fontFamily.semibold`  |
| `Nunito_700Bold`      | Nunito-Bold.ttf       | `fontFamily.bold`      |
| `Nunito_800ExtraBold` | Nunito-ExtraBold.ttf  | `fontFamily.extrabold` |
| `Nunito_900Black`     | Nunito-Black.ttf      | `fontFamily.black`     |

---

# Цвета

```tsx
// ❌ НЕПРАВИЛЬНО — хардкод
color: '#FF6A3D'
backgroundColor: '#FFF8F3'

// ✅ ПРАВИЛЬНО — токены
color: colors.primary
backgroundColor: colors.bg
```

| Токен                    | Hex                      | Назначение                               |
|--------------------------|--------------------------|------------------------------------------|
| `colors.primary`         | `#FF6A3D`                | Кнопки, активные элементы, акцент        |
| `colors.primarySoft`     | `#FFE7DC`                | Фон выбранных элементов / selected-state |
| `colors.primaryGhost`    | `#FFF4EF`                | Фон карточек, подложки                   |
| `colors.primaryDeep`     | `#B5462A`                | Текст/иконки поверх soft-фона, pressed   |
| `colors.primaryDisabled` | `#FFB59E`                | Недоступная кнопка                       |
| `colors.primaryGlow`     | `rgba(255,106,61,0.32)`  | Тени, свечение акцента                   |
| `colors.accent`          | `#FFB23E`                | Второстепенный акцент, конфетти          |
| `colors.ok`              | `#33B27D`                | Успех, положительные подтверждения       |
| `colors.danger`          | `#EF4444`                | Ошибки, деструктивные действия           |
| `colors.text`            | `#2E211B`                | Заголовки, основной тёмный текст         |
| `colors.textSecondary`   | `#7E6E64`                | Описания, вторичный текст                |
| `colors.textMuted`       | `#BBAA9F`                | Заглушки, неактивный текст               |
| `colors.bg`              | `#FFF8F3`                | Фон экранов                              |
| `colors.surface`         | `#FFFFFF`                | Карточки, плашки, нижняя навигация       |
| `colors.border`          | `#EFE2D8`                | Бордеры инпутов / карточек               |
| `colors.track`           | `#F2E5DB`                | Трек прогресса, заблокированные узлы     |
| `colors.onPrimary`       | `#FFFFFF`                | Текст поверх акцентной заливки           |

---

# Типографика

Сначала проверяй, покрывает ли пресет `typography` нужный случай.
Только если не покрывает — собирай вручную из `fontFamily` + `fontSize`.

```tsx
// ❌ НЕПРАВИЛЬНО — хардкод
fontFamily: 'Nunito_700Bold'
fontSize: 22
lineHeight: 27

// ✅ ПРАВИЛЬНО — пресет через spread
const styles = StyleSheet.create({
  title: { ...typography.title },
  caption: { ...typography.caption, color: colors.primary }, // цветовой override допустим
});

// ✅ ПРАВИЛЬНО — ручная сборка только когда пресет не подходит
fontFamily: fontFamily.bold
fontSize: fontSize.label
```

| Пресет               | fontFamily       | fontSize | Назначение                          |
|----------------------|------------------|----------|-------------------------------------|
| `typography.display` | black (900)      | 30       | Экран-приветствие, праздник         |
| `typography.h1`      | black (900)      | 27       | Заголовки экранов                   |
| `typography.title`   | extrabold (800)  | 22       | Крупные секции                      |
| `typography.subtitle`| extrabold (800)  | 19       | Вопрос в тесте, подзаголовки        |
| `typography.body`    | semibold (600)   | 16       | Основной текст (цвет textSecondary) |
| `typography.bodyStrong`| bold (700)     | 16       | Основной текст (цвет text)          |
| `typography.label`   | extrabold (800)  | 15       | Подписи карточек, кнопки            |
| `typography.caption` | bold (700)       | 13       | Вторичные подписи                   |
| `typography.small`   | bold (700)       | 12       | Таб-бар, мелкие метки               |

---

# Отступы

```tsx
// ❌ НЕПРАВИЛЬНО
padding: 16
marginBottom: 24
paddingHorizontal: 20

// ✅ ПРАВИЛЬНО
padding: spacing.lg           // 16
marginBottom: spacing['2xl']  // 24
paddingHorizontal: spacing.screenH // 20
```

| Токен            | px |
|------------------|----|
| `spacing.xs`     | 4  |
| `spacing.sm`     | 8  |
| `spacing.md`     | 12 |
| `spacing.lg`     | 16 |
| `spacing.xl`     | 20 |
| `spacing['2xl']` | 24 |
| `spacing['3xl']` | 32 |
| `spacing.screenH`| 20 |
| `spacing.screenV`| 22 |

---

# Радиусы

```tsx
// ❌ НЕПРАВИЛЬНО
borderRadius: 22
borderRadius: 999

// ✅ ПРАВИЛЬНО
borderRadius: radii.lg    // 22 — карточки
borderRadius: radii.pill  // 999 — кнопки-пилюли, чипы
borderRadius: radii.md    // 16
borderRadius: radii.sm    // 10
```

---

# Тени

```tsx
// ❌ НЕПРАВИЛЬНО — прямой хардкод
shadowColor: '#FF6A3D'
shadowOffset: { width: 0, height: 8 }
elevation: 6

// ✅ ПРАВИЛЬНО — готовые пресеты через spread
const styles = StyleSheet.create({
  btn:  { ...shadows.button }, // акцентная кнопка
  card: { ...shadows.card },   // карточка на экране
});
```

---

# Эталонный компонент (шаблон)

```tsx
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../constants/themes/themes';

interface DirectionCardProps {
  title: string;
  description: string;
  onPress: () => void;
  isSelected?: boolean;
}

export default function DirectionCard({ title, description, onPress, isSelected = false }: DirectionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  title: {
    ...typography.label,
  },
  description: {
    ...typography.body,
    marginTop: spacing.xs,
  },
});
```

---

# Карта миграции (рефакторинг хардкодов)

| Было (хардкод)          | Стало (токен)                               |
|-------------------------|---------------------------------------------|
| `'#FF6A3D'`             | `colors.primary`                            |
| `'#FFF8F3'`             | `colors.bg`                                 |
| `'#FFFFFF'`             | `colors.surface`                            |
| `'#2E211B'`             | `colors.text`                               |
| `'#7E6E64'`             | `colors.textSecondary`                      |
| `'#BBAA9F'`             | `colors.textMuted`                          |
| `'#EFE2D8'`             | `colors.border`                             |
| `'#EF4444'`             | `colors.danger`                             |
| `'#33B27D'`             | `colors.ok`                                 |
| `'#FFE7DC'`             | `colors.primarySoft`                        |
| `'#FFF4EF'`             | `colors.primaryGhost`                       |
| `'#B5462A'`             | `colors.primaryDeep`                        |
| `fontSize: 30`          | `...typography.display`                     |
| `fontSize: 27`          | `...typography.h1`                          |
| `fontSize: 22`          | `...typography.title`                       |
| `fontSize: 19`          | `...typography.subtitle`                    |
| `fontSize: 16`          | `...typography.body` или `...typography.bodyStrong` |
| `fontSize: 15`          | `...typography.label`                       |
| `fontSize: 13`          | `...typography.caption`                     |
| `fontSize: 12`          | `...typography.small`                       |
| `padding: 16`           | `spacing.lg`                                |
| `padding: 20`           | `spacing.xl`                                |
| `padding: 24`           | `spacing['2xl']`                            |
| `borderRadius: 22`      | `radii.lg`                                  |
| `borderRadius: 16`      | `radii.md`                                  |
| `borderRadius: 10`      | `radii.sm`                                  |
| `borderRadius: 999`     | `radii.pill`                                |
| `'Nunito_400Regular'`   | `fontFamily.regular`                        |
| `'Nunito_700Bold'`      | `fontFamily.bold`                           |
| `'Nunito_800ExtraBold'` | `fontFamily.extrabold`                      |
| `'Nunito_900Black'`     | `fontFamily.black`                          |

---

# Design Tokens Checklist

- [ ] Нет хардкоженых hex-цветов — только `colors.*`
- [ ] Нет хардкоженых `fontFamily` строк — только `fontFamily.*` или пресет `typography.*`
- [ ] Нет хардкоженых `fontSize` чисел — только `fontSize.*` или пресет `typography.*`
- [ ] Нет хардкоженых отступов (padding/margin) — только `spacing.*`
- [ ] Нет хардкоженых `borderRadius` чисел — только `radii.*`
- [ ] Тени взяты из `shadows.button` или `shadows.card`, не написаны вручную
- [ ] Каждый `<Text>` получает стиль из `typography.*` (иначе системный шрифт вместо Nunito)
