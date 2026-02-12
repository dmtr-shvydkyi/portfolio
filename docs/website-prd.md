# Website PRD and Technical Specification

Status: Active
Owner: Portfolio maintainer
Last updated: 2026-02-12
Canonical path: `docs/website-prd.md`

## 1) Purpose

This document is the source of truth for how the website works across product, UX, content, technical architecture, logic, and operations.

It exists to make behavior explicit, reduce regressions, and keep implementation decisions discoverable for future updates.

## 2) Source Of Truth Policy (Mandatory)

Every time we make changes, we must update this document.

Required process for every PR:
1. Implement the code change.
2. Update this file to reflect the new behavior and decisions.
3. Add or update the "Change log" section in this file.
4. Merge only when code and docs match.

Enforcement rule:
- A PR is incomplete if it changes website behavior, content, architecture, or operations without updating `docs/website-prd.md`.

Scope that requires doc updates includes (not limited to):
- UI and interaction changes
- Navigation or keyboard shortcut changes
- Game logic or scoring changes
- API contract changes
- Data storage keys (cookies/localStorage/Redis)
- Environment variables and deployment/runtime behavior
- Metadata/SEO/PWA configuration

## 3) Product Summary

The site is a highly stylized, single-route portfolio with tab-based sections:
- Work
- About
- Play (custom Snake game)
- Resume

Primary goals:
- Showcase design work in an immersive way
- Present personal profile and context
- Provide playful interaction via Snake
- Provide resume access and contact links

Secondary goals:
- Preserve a strong visual identity (mono type, black/white, glitch/motion)
- Encourage exploration through keyboard interaction

## 4) Audience

Primary users:
- Hiring managers
- Design leaders
- Product peers
- Collaborators and clients

User intent:
- Evaluate design quality and product taste
- Understand background and experience
- Access resume and contact links

## 5) Site Architecture

Framework:
- Next.js App Router, one main route (`/`) plus file-based 404 route.

High-level tree:
- `src/app/layout.tsx` - root layout, metadata, analytics wrappers
- `src/app/page.tsx` - main tab shell and global keyboard tab switching
- `src/components/SharedLayout.tsx` - shared two-panel layout
- `src/components/*` - tab content and reusable UI
- `src/app/api/snake/leaderboard/route.ts` - leaderboard API

Routes:
- `/` - primary app shell with tabs
- `/api/snake/leaderboard` - leaderboard GET/POST
- `not-found.tsx` -> custom `404`

## 6) Visual and Interaction Direction

Visual language:
- Monochrome, high-contrast UI
- Mono typography throughout
- Compact uppercase labels
- Motion-based personality (fade-in, glitch, scrolling ticker, game animations)

Global layout behavior:
- Desktop: 4-column grid where left panel is identity/status and right panel is content.
- Mobile: stacked layout with fixed-height top identity panel and flexible content panel.

Global interaction model:
- Keyboard sounds on most tab/button/link interactions.
- Number keys and arrow keys control tab selection globally.
- Site-level white overlay fades out on initial load.

## 7) Detailed Feature Specification

### 7.1 Root Layout and Metadata

File: `src/app/layout.tsx`

Defined behavior:
- Sets `metadataBase` to `https://shvydkyi.me`.
- Sets title/description for site and social previews.
- References `/manifest.json`.
- Configures Open Graph and Twitter preview with `/og.jpg`.
- Includes Vercel Analytics and Speed Insights in `<body>`.

### 7.2 Home Shell and Tab Routing

File: `src/app/page.tsx`

Tab model:
- Internal tab states: `work | info | play | resume`.
- Initial tab: `work`.

Global keyboard shortcuts:
- `1` -> Work
- `2` -> About
- `3` -> Play
- `4` -> Resume
- `5` -> Toggle Connect menu
- `ArrowLeft` / `ArrowRight` -> cycle tabs

Guardrails:
- Keyboard shortcuts are ignored while typing in `input`/`textarea`.

Render model:
- All tab panels are mounted and layered absolutely.
- Inactive tabs use `opacity-0` + `pointer-events-none`.

### 7.3 Shared Layout

File: `src/components/SharedLayout.tsx`

Left panel:
- Logo (click -> switch to Work)
- Name + role text
- "Currently at" link to Skylum
- Bottom status bar with Time and RunningNews ticker

Right panel:
- Active tab content region
- Bottom controls: TabsNavigation + ConnectButton

### 7.4 Work Tab

Files:
- `src/components/Work.tsx`
- `src/components/ScrollCards.tsx`

Behavior:
- Vertical scroll list of media cards (video/image).
- Cards show overlay metadata and outbound links on hover.
- Videos autoplay, loop, muted, and attempt recovery on `canplay`.

Content source:
- Card data is hardcoded in `ScrollCards.tsx`.
- Assets are served from `/public/*`.

### 7.5 About Tab

Files:
- `src/components/About.tsx`
- `src/components/GlitchScramble.tsx`

Behavior:
- Displays biography copy with inline outbound links.
- Applies pointer-trail glitch scramble effect to non-interactive text characters.
- Interactive elements (links, buttons, form controls) are intentionally excluded from scrambling.

Accessibility/resilience:
- Effect is disabled when `prefers-reduced-motion: reduce`.
- Character centers are recomputed on resize and scroll for accurate effect area.

### 7.6 Play Tab (Snake Game)

Files:
- `src/components/Play.tsx`
- `src/components/Leaderboard.tsx`

Game states:
- `idle` -> intro/start
- `playing` -> active game loop
- `paused` -> paused overlay
- `dying` -> crumble + fade transition
- `gameOver` -> score summary + restart

Board and timing constants:
- Grid: `25 x 25`
- Base cell size: `16px`
- Base speed: `150ms`
- Minimum speed: `70ms`
- Speed increase rule: every `4` foods, reduce interval by `10ms` until min speed

Controls:
- Keyboard: `W/A/S/D` and arrow keys
- Pause: `Space`
- Mobile swipe on board
- Mobile D-pad shown for coarse pointers (`(pointer: coarse)`)

Movement rules:
- No 180-degree immediate reversal.
- Direction updates are staged via `nextDirectionRef`.
- Wall collision and self collision trigger death sequence.

Scoring:
- Score increments by 1 per food.
- Best score persisted in localStorage key `snake-game-best-score`.

Death/game-over sequence:
- On collision, loop stops and dead sound plays.
- Snake segments become animated "death chunks" with staggered crumble.
- Board fades out, then transitions to game-over screen.

Leaderboard behavior:
- Fetch top entries on mount and when idle.
- Submit score once per run on game over (guarded by run ID).
- Display max 5 entries in UI.

Nickname behavior:
- Cookie key: `snake_nick`
- Format: `N.N.N.XXX` where `N` is 0-999 and `XXX` is 3 chars `[A-Z0-9]`
- Cookie lifetime: 365 days, `SameSite=Lax`, `Secure` on HTTPS

Audio:
- Local sound files: `/eat.mp3`, `/dead.mp3`
- Volume for both effects set to `0.5`

### 7.7 Resume Tab

File: `src/components/Resume.tsx`

Behavior:
- Shows resume preview image.
- Image and "Open" link both open external Google Drive CV URL.
- Clicks trigger keyboard sound.

### 7.8 Connect Menu

File: `src/components/ConnectButton.tsx`

Behavior:
- Toggle between default button and expanded panel.
- Expanded panel links: LinkedIn, Twitter/X, Email.
- Can be toggled by click or global key `5` from home shell.

### 7.9 Time and Running News

Files:
- `src/components/Time.tsx`
- `src/components/RunningNews.tsx`

Time:
- Shows animated random values for first ~3 seconds, then real Kyiv time.
- Colon flashes every second.

Running news ticker:
- Default text: `always under construction`
- Infinite horizontal marquee animation
- On hover, playback rate slows (not hard pause by default)
- Animation disabled for reduced-motion users

### 7.10 404 Experience

Files:
- `src/app/not-found.tsx`
- `src/components/NotFound.tsx`

Behavior:
- Reuses visual language with status bar and dark content area.
- Displays large `404` and "go home" link.

## 8) API Specification

Endpoint: `/api/snake/leaderboard`
File: `src/app/api/snake/leaderboard/route.ts`
Runtime: Node.js (`export const runtime = 'nodejs'`)

Storage:
- Redis sorted set key: `snake:leaderboard`
- Retention: top `500` entries max

### GET

Query params:
- `limit` (optional)

Rules:
- Default limit: `5`
- Max limit: `20`

Response:
- `200` with `{ entries: Array<{ nick, score, ts }> }`
- On internal failure: returns `{ entries: [] }` (still JSON)

### POST

Request JSON:
- `{ score: number, nick: string }`

Validation:
- `score` must be integer > 0
- `nick` must match `/^\d{1,3}\.\d{1,3}\.\d{1,3}\.[A-Z0-9]{3}$/`
- First 3 numeric blocks must each be in range `0..999`

Writes:
- Entry object includes UUID id and timestamp
- Sorted set score formula: `score + ts / 1e13`
- Tie-break approximation: newer timestamp slightly increases ranking

Cleanup:
- If entries exceed 500, remove lowest ranks

Responses:
- Success: `{ ok: true }`
- Invalid input: `400` + `{ error: 'Invalid score' | 'Invalid nickname' }`
- Server error: `500` + `{ error: 'Server error' }`

## 9) Data Persistence and Keys

Browser storage:
- `localStorage['snake-game-best-score']` -> integer best score
- Cookie `snake_nick` -> generated leaderboard nickname

Server storage:
- Redis ZSET `snake:leaderboard`

Environment variables for Redis URL resolution (first non-empty wins):
1. `REDIS_URL`
2. `REDIS_TLS_URL`
3. `VERCEL_REDIS_URL`
4. `VERCEL_REDIS_TLS_URL`

If none are present, Redis client initialization throws and API handlers fall back to safe failure behavior.

## 10) Styling, Motion, and Assets

Global styles:
- `src/app/globals.css`
- Tailwind v4 imported via `@import "tailwindcss"`

Core style traits:
- White page background in shell left area + dark content area right side
- Mono font enforced globally
- Custom keyframes: ticker scroll, snake crumble, logo glitch shake

Notable static assets (examples):
- `/public/og.jpg` - social preview image
- `/public/logo-lol.png` - logo
- `/public/*.mp4|*.jpg` - work media cards
- `/public/eat.mp3`, `/public/dead.mp3` - game sounds

## 11) SEO, PWA, and Crawling

Metadata and social cards:
- Defined in `src/app/layout.tsx`

Web app manifest:
- `src/app/manifest.json`

Crawling files:
- `public/robots.txt`
- `public/sitemap.xml`

## 12) Analytics and Performance

Integrated tooling:
- `@vercel/analytics`
- `@vercel/speed-insights`

Current integration point:
- Included in root layout so instrumentation applies site-wide.

## 13) Accessibility Notes

Implemented:
- Reduced-motion fallbacks for running news and glitch effect
- Mobile controls for Snake

Known gaps:
- Several custom clickable elements are `div`/`span` driven rather than semantic buttons/links.
- Hover-dependent overlays in Work can reduce discoverability on touch devices.

## 14) Known Limitations and Suggested Improvements

Product/UX limitations:
1. Internal navigation path handling is mixed with external-link behavior in custom `Link` component.
2. `newsData.ts` exists but is currently unused by running ticker.
3. Keyboard accessibility can be improved for custom tab/button elements.

Technical improvement opportunities:
1. Replace deprecated/legacy timezone alias (`Europe/Kiev`) with modern canonical value (`Europe/Kyiv`) where appropriate.
2. Split large Snake component into smaller units for maintainability and testability.
3. Add lightweight tests for API validation and key gameplay invariants.

## 15) Non-Goals (Current Version)

- Multi-page content architecture
- Authentication/accounts
- CMS-driven content
- Real-time multiplayer or shared game sessions

## 16) Change Log

### 2026-02-12
- Created initial full PRD/technical specification from current codebase behavior.
- Established mandatory source-of-truth update policy for every future change.
