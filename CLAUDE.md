# NewBuild Connect — Claude Code Project Guide

## Project Overview
React Native + Expo mobile app for a New Construction Real Estate Strategist in Arizona.
Serves Veterans, First-Time Buyers, Seniors (55+), and Relocation buyers.
Project location: `C:\Users\phill\newbuild-connect`

## Running the App
```
cd C:\Users\phill\newbuild-connect
npx expo start
```
Scan QR code with Expo Go (iOS/Android) or press 'a' for Android emulator, 'i' for iOS simulator.

## Environment Setup
Copy `.env.local` and fill in:
- `EXPO_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings  
- `EXPO_PUBLIC_ANTHROPIC_API_KEY` — from Anthropic console

## Agent Configuration
Update agent name, phone, email in `/src/constants/agent.ts`

## Stack
- Expo SDK 56, TypeScript strict, Expo Router (file-based)
- Zustand (global state), React Query (server data)
- Supabase (auth + database), Anthropic Claude API
- React Native Reanimated 3, react-native-maps

## Design System
All colors, typography, spacing, shadows in `/src/design-system/`
**Always use design system tokens — never hardcode colors or sizes.**

## AI Integration
- Service: `/src/services/anthropic.ts`
- Always include full buyer profile context in system prompt
- Stream responses for all AI chat interactions
- Model: `claude-sonnet-4-20250514`, max_tokens: 1000

## File Structure
```
app/
  _layout.tsx          ← Root layout, providers
  index.tsx            ← Redirect based on onboarding state
  (auth)/              ← Onboarding + auth screens
    welcome.tsx
    buyer-type-select.tsx
    base-select.tsx    ← Military buyers only
    profile-setup.tsx
    meet-strategist.tsx
    sign-in.tsx
  (tabs)/              ← Main app tabs
    index.tsx          ← Dashboard
    communities.tsx
    journey.tsx
    advisor.tsx        ← Claude AI chat
    profile.tsx
  community/[id].tsx   ← Community detail
  milestone/[id].tsx   ← Milestone celebration modal
src/
  design-system/       ← theme.ts, typography.ts, spacing.ts, shadows.ts
  components/          ← Shared UI components
  stores/              ← Zustand stores (buyer.ts, app.ts)
  services/            ← anthropic.ts, supabase.ts, notifications.ts
  constants/           ← communities.ts, incentives.ts, agent.ts, journey-steps.ts, bases.ts
  types/               ← TypeScript interfaces
```

## Code Conventions
- Functional components + hooks only
- Business logic in `/src/hooks/` and `/src/services/`
- Keep components pure — no direct API calls in components
- All async operations wrapped in try/catch with user-facing error states
- Loading states using Skeleton components
- Minimum tap target: 44×44pt (accessibility)

## Performance Rules
- No inline functions in render
- Use FlashList over FlatList for large lists
- All images via expo-image (lazy + caching)
- Avoid useEffect chains — prefer event-driven state

## Agent Persona
Configured in `/src/constants/agent.ts` — update name, phone, email before shipping.
Every buyer type gets a distinct personalized experience throughout the app.
