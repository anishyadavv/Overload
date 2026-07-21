# WorkoutLog

A React Native (Expo) gym tracking app driven by a weekly workout plan.

## Features

- **Weekly Plan** — Assign routines to each day of the week (Mon–Sun)
- **Auto-detect today** — Home screen shows today's planned routine automatically
- **Last session reference** — See your previous session while logging today
- **Fast logging** — Pre-populated exercises with placeholder weights/reps from last time
- **Warmup sets** — Flag warmups (excluded from volume calculations)
- **History** — Browse past sessions by routine
- **Progress** — Track weight and volume trends per exercise

## Tech Stack

- React Native + Expo (managed workflow)
- TypeScript
- React Navigation (bottom tabs + stack)
- Zustand + AsyncStorage (persistent state)
- date-fns, expo-haptics, react-native-keyboard-aware-scroll-view

## Getting Started

```bash
cd WorkoutLog
npm install
npm start
```

### Run with Expo Go

1. Install **Expo Go** on your Android phone (Play Store) — must support **SDK 56**
2. Make sure your phone and PC are on the same Wi-Fi network
3. Run `npm start` and scan the QR code with Expo Go

If you see "Project is incompatible", update Expo Go from the Play Store, or install the matching version from https://expo.dev/go (select SDK 56).

## Testing Guide

### 1. Onboarding / Plan Setup
- Launch the app → Plan Setup screen appears
- Default routines are pre-created (Push, Pull, Legs, Rest Day)
- Assign routines to each weekday
- Tap **Start Training**

### 2. Home / Log Session
- Header shows today's day and routine
- Rest days show a rest message with option to override
- Enter weight/reps for sets; tap checkmark for haptic feedback
- Toggle **W** for warmup sets
- Tap **Save Session** for success haptic

### 3. Edit Today's Session
- Re-open the app same day → session loads in **Editing** mode (no duplicate)

### 4. Override Routine
- Tap "Choose a different routine" to log a non-planned workout for today

### 5. History
- **History** tab → tap a routine → see all sessions → tap for detail

### 6. Plan
- **Plan** tab → edit day mappings, add/rename/delete routines

### 7. Progress
- **Progress** tab → tap an exercise → see max weight trends and volume

## Project Structure

```
src/
  components/   # ExerciseRow, SetInput, DayRoutineRow, LastSessionCard, LogSessionView
  navigation/   # Tab + Stack navigators
  screens/      # Home, PlanSetup, WeeklyPlan, History, SessionDetail, Progress
  store/        # Zustand + AsyncStorage persistence
  types/        # Flat relational data model
  utils/        # dateHelpers, selectors, chartCalculations
  theme/        # Dark mode colors
```
