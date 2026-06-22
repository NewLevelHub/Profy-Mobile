# profi-mobile

MVP-приложение по профориентации и построению роадмапа развития ребёнка (6–18 лет).

## Стек

- **Expo** ~56.0.12
- **React Native** 0.85.3
- **React** 19.2.3
- **TypeScript** ~6.0.3

## Зависимости

| Пакет | Версия | Назначение |
|---|---|---|
| `expo` | ~56.0.12 | Платформа |
| `react-native` | 0.85.3 | Фреймворк |
| `react` | 19.2.3 | UI-библиотека |
| `@react-navigation/native` | ^7.3.3 | Навигация |
| `@react-navigation/native-stack` | ^7.17.5 | Stack-навигатор |
| `react-native-screens` | 4.25.2 | Нативные экраны для навигации |
| `react-native-safe-area-context` | ~5.7.0 | Safe area для навигации |
| `zustand` | ^5.0.14 | Стейт-менеджмент |
| `axios` | ^1.18.0 | HTTP-клиент |
| `react-native-paper` | ^5.15.3 | UI-компоненты |
| `react-native-vector-icons` | ^10.3.0 | Иконки |
| `expo-status-bar` | ~56.0.4 | Статус бар |

## Dev-зависимости

| Пакет | Версия |
|---|---|
| `typescript` | ~6.0.3 |
| `@types/react` | ~19.2.2 |

## Структура проекта

```
src/
├── api/          # axios-клиент
├── components/   # переиспользуемые компоненты
├── navigation/   # навигаторы
├── screens/      # экраны
├── store/        # zustand-сторы
└── types/        # TypeScript-типы
```

## Запуск

```bash
cp .env.example .env
npx expo start
```

## Переменные окружения

Смотри `.env.example`.
