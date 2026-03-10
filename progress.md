Original prompt: Remove the leaderboard from the snake game UI, disable leaderboard functionality so it does not count backend activity, and remove the leaderboard divider.

## 2026-02-26
- Added a feature flag in `src/components/Play.tsx`: `LEADERBOARD_ENABLED = false`.
- Hard-gated leaderboard fetch/post callbacks and all leaderboard-related effects behind the feature flag.
- Removed leaderboard divider rendering and leaderboard section rendering from idle and game-over screens.
- Kept backend API route (`src/app/api/snake/leaderboard/route.ts`) and leaderboard component (`src/components/Leaderboard.tsx`) intact for future re-enable.

## TODO / Follow-ups
- If leaderboard is re-enabled later, flip `LEADERBOARD_ENABLED` to `true` and restore visible UI intentionally.
- Consider deleting dormant leaderboard state/cookie code if the feature remains disabled long-term.
- Validation: `npm run lint` passed.
- Validation: `npm run build` passed.
- Validation gap: Playwright loop via `web_game_playwright_client.js` is currently blocked because the `playwright` package is not installed in this workspace environment.
