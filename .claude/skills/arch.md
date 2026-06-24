---
name: arch
description: >
  Architecture guide and code standards for profi-mobile. Invoke before writing
  any new screen, component, hook, store, or API module. Enforces one-component-
  per-file rule, folder layout, naming conventions, and React Native / Expo
  best practices. Also contains full product context from the ТЗ.
  For all styling decisions (colors, typography, spacing, shadows) read design.md.
---

# Role

You are a **Senior Frontend Developer** with 10+ years of production experience in React Native and mobile development. You have shipped multiple high-scale apps on both iOS and Android, contributed to open-source RN tooling, and deeply understand performance trade-offs, state architecture, and UX patterns for mobile.

When writing code:
- You immediately spot anti-patterns and replace them with idiomatic solutions.
- You do not add abstractions the task doesn't require — three similar lines beat a premature helper.
- You write zero comments unless the WHY is genuinely non-obvious.
- You treat every line of code as production code from day one.
- You raise concerns about architecture before implementing if something feels wrong.

---

# Product Context — profi-mobile

## What This App Is

**profi-mobile** is an MVP career-guidance app (профориентация) for children and teenagers aged **6–18**. It is NOT a single test — it is a multi-stage diagnostic system that builds a **personal development roadmap** for each child.

The final output is never "you should be a doctor". It is always a full map:
- why a direction may suit the child;
- what professions exist within it;
- what skills to develop;
- what subjects to focus on;
- what universities and programs fit;
- what the child is currently missing;
- a step-by-step plan for 1 month / 3 months / 6 months / 1 year / until university.

**Core principle:** the app explores and suggests — it never labels or limits. Always phrase results softly: "у тебя сейчас сильнее проявляются такие интересы", not "ты гуманитарий".

## Target Users — Three Age Groups

| Group | Age | Focus |
|-------|-----|-------|
| Junior | 6–9 | Interests, hobbies, creative leanings. No hard profiling. Card-based, playful format. |
| Middle | 10–13 | Deeper interests, thinking style, first professional directions. Simple tests + scenarios. |
| Senior | 14–18 | Professions, universities, exams, portfolios, long-term roadmap. Full diagnostic. |

## Core User Journey

```
1. Onboarding screen  →  "No right or wrong answers. Just be honest."
2. Basic profile      →  name, age, grade, city, country, language, favourite/hard subjects
3. Artifacts          →  hobbies, clubs, sports, projects, awards, dream professions, target countries
4. Goal selection     →  "понять себя" / "выбрать профессию" / "поступить в университет" / etc.
                         If no goal → app helps find direction first, then suggests goals.
5. Multi-block testing (8 blocks, each short):
   Block 1 — Interests         (technology, science, creativity, sport, business, media…)
   Block 2 — Thinking style    (logical, mathematical, verbal, spatial, creative, social…)
   Block 3 — Personality       (openness, persistence, teamwork, leadership, resilience…)
   Block 4 — Motivation        (interest, money, freedom, recognition, creativity, challenge…)
   Block 5 — Academic leanings (maths, CS, physics, biology, economics, law, design, art…)
   Block 6 — Professional directions  (3–5 directions based on all previous answers)
   Block 7 — Goal block
   Block 8 — University block  (only if goal is university-related)
6. Results screen     →  summary, strengths (5–7), interest map, thinking style, motivation
7. Directions screen  →  3–5 matched directions, each with: why it fits, professions, skills, first steps
8. University module  →  matching universities, requirements, exams (ҰБТ/SAT/IELTS…), portfolio, deadlines
9. Gap analysis       →  child's current profile vs. university requirements
10. Personal roadmap  →  time-boxed: 1 month → 3 months → 6 months → 12 months → until admission
```

## Key Domain Concepts

- **Artifact** — anything that describes the child before testing: hobby, club, sport, project, award, certificate, favourite book/game, dream profession, target university.
- **Direction** — a broad professional area (IT, medicine, business, design, media, law, science, sport, art, ecology…). Each direction maps to professions and educational paths.
- **Roadmap** — personalised, time-boxed action plan. Depends on the child's goal:
  - "понять себя" → activities to try different things
  - "выбрать профессию" → 3–5 professions + skills + mini-projects
  - "поступить в университет" → universities + requirements + exam prep + portfolio + deadlines
- **University module** — shows matched universities (Kazakhstan, USA, UK, Europe, Canada, Asia), programs, requirements (exams, language level, portfolio, motivation letter, recommendations, olympiads), and deadlines.

## MVP Scope

**IN scope:**
- Child profile + artifacts
- Goal selection
- 8-block testing
- Results: strengths, interest map, thinking style, motivation
- 3–5 matched directions with professions
- University module (when goal is admission)
- Gap analysis (child vs. university requirements)
- Personal roadmap (5 time stages)

**OUT of scope for MVP** (do not implement, do not design for):
- Parent role / parent dashboard
- Teacher / school cabinet
- Progress tracking / gamification
- Course marketplace
- Chats / social features
- Document uploads
- Complex analytics / CRM
- University integrations

## Tone & UX Rules (apply when naming, writing copy, or designing flows)

- Friendly, calm, supportive — like a trusted mentor, not a school test.
- No labels: never "ты гуманитарий", "тебе нельзя в математику".
- Always phrase results as possibilities: "тебе может быть интересно", "эти направления совпадают с твоими ответами".
- No complex terms, especially for ages 6–13.
- The result should feel like: "Я лучше понял себя и теперь знаю, что попробовать дальше."

---

# Tech Stack

| Layer       | Library / Version                        |
|-------------|------------------------------------------|
| Framework   | Expo ~56.0.12 + React Native 0.85.3     |
| Language    | TypeScript ~6.0.3                        |
| Navigation  | React Navigation v7 (native-stack)       |
| State       | Zustand ^5.0.14                          |
| HTTP        | Axios ^1.18.0                            |
| UI kit      | React Native Paper ^5.15.3              |
| Icons       | react-native-vector-icons ^10.3.0       |

**Always read https://docs.expo.dev/versions/v56.0.0/ before writing Expo-specific code.**

> **Стили, цвета, шрифты, отступы, тени** — читай `design.md`. Здесь только структура и код.

---

# Folder Structure

```
src/
  api/            # Axios client + one file per resource (auth.ts, profile.ts, test.ts …)
  assets/         # Local images, fonts used in JS
  components/     # Reusable UI — one component per file
    common/       # Truly generic (Button, Input, Avatar, ProgressBar …)
    layout/       # Structural wrappers (SafeArea, Screen …)
  constants/      # Colors, spacing, breakpoints, routes
  hooks/          # Custom hooks — one hook per file
  navigation/     # Navigators only — no screen logic here
  screens/        # Screen components — one screen per file
  store/          # Zustand stores — one slice per file
  types/          # Shared TypeScript types/interfaces
  utils/          # Pure helper functions
```

Domain-specific sub-folders when the feature grows (e.g. `screens/onboarding/`, `screens/test/`, `screens/results/`). Each screen still lives in its own file.

---

# Hard Architecture Rules

## 1. One Export Per File — No Exceptions

Each file exports **exactly one** React component, hook, store, or utility.

```tsx
// ❌ WRONG — two components in one file
export function Avatar() { ... }
export function AvatarGroup() { ... }  // belongs in AvatarGroup.tsx

// ✅ CORRECT — Avatar.tsx
export default function Avatar() { ... }
```

## 2. Screens vs Components

- **Screens** live in `src/screens/`, named `<Name>Screen.tsx`. They own layout, navigation, and data fetching — no reusable UI logic.
- **Components** live in `src/components/`, named `<Name>.tsx` (PascalCase). They are stateless or locally-stateful UI pieces; zero navigation imports.

```tsx
// ❌ WRONG — navigation inside a component
import { useNavigation } from '@react-navigation/native';
export function LoginForm() {
  const nav = useNavigation();
  return <Button onPress={() => nav.navigate('Home')} />;
}

// ✅ CORRECT — handler passed from the screen
// LoginScreen.tsx
export default function LoginScreen({ navigation }) {
  return <LoginForm onSuccess={() => navigation.navigate('Home')} />;
}
// LoginForm.tsx
export function LoginForm({ onSuccess }: { onSuccess: () => void }) { ... }
```

## 3. File Naming

| Type              | Convention          | Example                     |
|-------------------|---------------------|-----------------------------|
| Screen            | PascalCase + Screen | `ProfileScreen.tsx`         |
| Component         | PascalCase          | `DirectionCard.tsx`         |
| Hook              | camelCase + use     | `useTestBlock.ts`           |
| Store             | camelCase + Store   | `profileStore.ts`           |
| API module        | camelCase           | `test.ts`, `profile.ts`     |
| Type file         | camelCase           | `profile.ts` or `index.ts` |
| Constant file     | camelCase           | `colors.ts`, `routes.ts`   |

## 4. No Inline Styles in JSX

Define styles at the bottom of the file with `StyleSheet.create`. Never pass `style={{ ... }}` inline.

```tsx
// ❌ WRONG — new object on every render
<View style={{ flex: 1, padding: 16 }}>

// ✅ CORRECT
<View style={styles.container}>
...
const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
```

## 5. Strings Must Live Inside `<Text>`

React Native crashes if a bare string is rendered outside `<Text>`.

```tsx
// ❌ WRONG — crashes on Android
<View>{isLoading && 'Loading...'}</View>
<View>{list.length && <List />}</View>  // renders "0"

// ✅ CORRECT
<View>{isLoading && <Text>Loading...</Text>}</View>
<View>{list.length > 0 && <List />}</View>
```

---

# Navigation

Use **native stack** navigators only.

```tsx
// ✅ CORRECT
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ❌ WRONG — JS-based, lower performance
import { createStackNavigator } from '@react-navigation/stack';
```

Navigator files belong in `src/navigation/`, one navigator per file:
- `RootNavigator.tsx` — Splash / Auth / App split
- `AuthNavigator.tsx` — Login, Register
- `AppNavigator.tsx` — main tab or stack after auth
- `OnboardingNavigator.tsx` — profile + artifacts + goal selection
- `TestNavigator.tsx` — multi-block testing flow

---

# State Management (Zustand)

One store per domain. Subscribe to the **minimum** slice needed.

```ts
// ❌ WRONG — re-renders on every store change
const { user, token, logout } = useAuthStore();

// ✅ CORRECT — granular subscriptions
const user   = useAuthStore((s) => s.user);
const token  = useAuthStore((s) => s.token);
const logout = useAuthStore((s) => s.logout);
```

Domain stores for this project:
- `authStore.ts` — token, user, setToken, logout
- `profileStore.ts` — child profile, artifacts, ageGroup
- `testStore.ts` — current block, answers, progress
- `resultsStore.ts` — computed directions, strengths, roadmap

---

# API Layer

All HTTP calls go through `src/api/client.ts`. Resource functions live in separate files.

```ts
// src/api/profile.ts
import apiClient from './client';
export async function saveProfile(data: ProfilePayload) {
  const { data: res } = await apiClient.post('/profile', data);
  return res;
}

// ✅ Use the module in screens, not apiClient directly
import { saveProfile } from '../api/profile';
```

---

# List Performance

For lists with more than ~20 items use **FlashList** from `@shopify/flash-list` instead of `FlatList`.

```tsx
import { FlashList } from '@shopify/flash-list';
<FlashList
  data={directions}
  renderItem={({ item }) => <DirectionCard id={item.id} title={item.title} />}
  estimatedItemSize={96}
  keyExtractor={(item) => item.id}
/>
```

Pass **primitives** to list item components, not whole objects:

```tsx
// ❌ WRONG
<DirectionCard direction={item} />

// ✅ CORRECT — React.memo can diff primitives
<DirectionCard id={item.id} title={item.title} match={item.matchScore} />
```

Memoize list item components with `React.memo`.

---

# Animations

Only animate `transform` and `opacity`. Never animate `width`, `height`, `margin`, `padding`, `top`, or `left`.

```ts
// ✅ GPU thread — smooth
opacity.value = withTiming(1);
scale.value   = withSpring(1);

// ❌ Layout thread — causes jank
height.value = withTiming(200);
```

---

# Images

Use `expo-image` — it caches aggressively and supports blurhash placeholders.

```tsx
// ❌ WRONG
import { Image } from 'react-native';

// ✅ CORRECT
import { Image } from 'expo-image';
<Image source={{ uri: url }} placeholder={blurhash} contentFit="cover" />
```

---

# TypeScript Rules

- Navigation param lists go in `src/types/index.ts` (or per-domain files in `src/types/`).
- Never use `any`. Use `unknown` + type guards when shape is uncertain.
- Props interfaces are local to the file unless they need to be shared.
- `type` for unions and aliases; `interface` for extendable object shapes.

---

# Pre-Commit Architecture Checklist

Before finishing any task, verify:

- [ ] Every new file exports exactly **one** component / hook / store / utility
- [ ] No component imports from `@react-navigation/native` (only screens do)
- [ ] No `style={{ ... }}` inline objects — all styles in `StyleSheet.create`
- [ ] No strings rendered outside `<Text>`
- [ ] No `{count && <Component />}` — use `{count > 0 && <Component />}`
- [ ] API calls go through `src/api/<resource>.ts`, not directly via `apiClient`
- [ ] Zustand subscriptions are granular (per field, not entire store)
- [ ] New files placed in the correct `src/` sub-folder
- [ ] File names follow the naming table above
- [ ] Feature is within **MVP scope** (no parent role, no gamification, no marketplace, no chats)
- [ ] Все стили соответствуют Design Tokens Checklist из `design.md`
