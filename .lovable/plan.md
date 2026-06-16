# Stabilize S.o.Skin UX & Branding

## 1. Centralized Strings (`src/lib/strings.ts`)
Create a single source of truth for every user-facing label that currently lives inline in components. Shape:

```ts
export const STRINGS = {
  brand: {
    name: "S.O.SKIN",
    tagline: { ar: "مستشارك الذكي للعناية بالبشرة", en: "Your AI-powered skincare advisor" },
  },
  home: { heroSub: { ar: "...", en: "..." }, smartTools: { ar: "أدوات ذكية", en: "Smart tools" }, ... },
  tour: { ... },
  academy: { ... },
} as const;
```

Refactor these files to read from `STRINGS` instead of inline ternaries:
- `src/routes/index.tsx` (header tagline, smart tools label, footer credit)
- `src/components/MobileShell.tsx` (trial banner copy)
- `src/components/SosAcademyPromoCard.tsx`
- `src/components/AcademyNotification.tsx`
- `src/components/FeatureTour.tsx` (all step copy)
- `src/components/Onboarding.tsx` (mission statement)

This eliminates the "text changes between pages" symptom: the brand tagline and section labels will be byte-identical everywhere they appear.

## 2. Fixed Welcome Banner
Add a slim, persistent banner inside `MobileShell` (above children, below the top utility row) that reads:

> **S.O.SKIN** — Your AI-powered skincare advisor / مستشارك الذكي للعناية بالبشرة

- Gold border + subtle gradient (uses existing `--primary` token, no hardcoded color).
- Renders on every authenticated screen so the value prop is always visible.
- Dismissible? No — user asked for "permanent". Keep it compact (~36px tall) so it doesn't crowd mobile.

## 3. Tour: Fire Once, Then Route to Scan
Update `src/components/FeatureTour.tsx`:
- Already uses `localStorage` key `soskin_tour_done` (verify). Confirm it only opens when key is absent AND user is authenticated AND onboarded.
- On final step "Finish", call `navigate({ to: "/scan" })` so the user lands on Analyze Product immediately.
- Make sure tour does NOT re-trigger on language toggle or theme toggle (guard the trigger effect with a `useRef` so it only evaluates once per mount).

## 4. Flicker / Re-render Fix
Root cause hypothesis: `useProfile()` writes to localStorage on every `update()`, and several components subscribe to the full profile object, causing cascades when `lang` flips. Fixes:
- In `useProfile`, memoize the returned object with `useMemo` keyed on actual fields so identity is stable.
- Replace inline `profile.lang === "ar" ? "x" : "y"` ternaries with `STRINGS.xxx[profile.lang]` (single property read = React's diff is cheaper, no string allocation per render).
- Ensure `MobileShell`'s trial banner only renders when `isTrialActive && !isPaidPro` — already does, but verify no `Date.now()` is read in render path (move trial calc into `usePaywall`'s memo).

## 5. Verification
- Toggle language → banner + tagline copy swaps cleanly, no other layout shift.
- Fresh localStorage → tour appears once, ends on `/scan`.
- Second visit → no tour, banner still present.
- Light + dark theme both show banner with gold accent.

## Technical Notes
- No new dependencies.
- No backend / schema changes.
- All edits are presentation-layer + one new `src/lib/strings.ts`.
- Files touched (~7): new `strings.ts`, plus the 6 components listed in §1, plus `useProfile.tsx` for the memo.
