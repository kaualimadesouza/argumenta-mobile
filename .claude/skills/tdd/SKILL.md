---
name: tdd
description: Test-driven development workflow for the Argumenta mobile app - write jest-expo + React Native Testing Library tests before any implementation, red first, then green, then refactor. Use when starting any card, implementing any component, screen, hook or fix, or whenever code is about to be written.
---

# TDD (owner decision: tests come first, always)

No component, hook or screen before a failing test that demands it.

## The cycle

1. **Derive the tests before touching src/**
   - Component/screen tests come from the card's acceptance criteria, one test
     per criterion, written with jest-expo + `@testing-library/react-native`:
     render, act like the student would (`fireEvent` / `userEvent`), assert
     what the screen shows.
   - Pure logic (formatting, derivations, API-response mapping, polling loops)
     gets plain unit tests, no rendering.
   - API calls are faked at the client boundary (`src/api/context.ts` provides
     the `ArgumentaApi` object) with typed fixtures that mirror the real
     backend contracts (argumenta-api pydantic responses). Prefer a scripted
     fake implementing `ArgumentaApi` over jest module mocks.
2. **Red**: run `npm test` and watch the new tests fail for the right reason.
3. **Green**: implement the minimum that satisfies them.
4. **Refactor** with the suite as the safety net; the thermo-nuclear review
   runs before the PR anyway.

Bugfixes: failing regression test first, then the fix, and the test stays.

## Rules that keep the suite honest

- Query like a user: `getByRole`, `getByText`, `getByLabelText` (via
  `accessibilityLabel`); `testID` only as a last resort. Never assert
  implementation details (style objects, internal state, call counts of
  internal helpers).
- Timers in polling/autosave tests run under `jest.useFakeTimers()` with
  explicit `jest.advanceTimersByTimeAsync`; never real `setTimeout` waits.
- Typed fixtures over ad-hoc object literals: one module of shared fixtures per
  API resource, matching the backend response types in `src/api/types.ts`.
- A test that fails after a refactor is information: fix the code or the
  contract, never weaken the assertion.
- Each acceptance criterion of the card maps to at least one test the PR
  description can point to.
