<div align="center">

# PALINDROME®

**An archive of things that haven’t happened yet.**

An experimental digital archive of fictional artifacts, impossible places, future events,<br />
intercepted signals, undated documents and lost technologies.

### [→ Visit the archive](https://palindrome-archive.vercel.app)

[![CI](https://github.com/NikitaMelnikit/palindrome-archive/actions/workflows/ci.yml/badge.svg)](https://github.com/NikitaMelnikit/palindrome-archive/actions/workflows/ci.yml)
[![Deployed on Vercel](https://img.shields.io/badge/deployed_on-Vercel-151515?logo=vercel&logoColor=white)](https://palindrome-archive.vercel.app)
![Next.js 16](https://img.shields.io/badge/Next.js-16-151515?logo=nextdotjs&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-151515?logo=react&logoColor=61dafb)
![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-151515?logo=typescript&logoColor=3178c6)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-151515?logo=tailwindcss&logoColor=38bdf8)
[![License: MIT](https://img.shields.io/badge/license-MIT-d7ff38?labelColor=151515)](LICENSE)

**English** · [Русский](README.ru.md)

<br />

<img src="docs/images/home.webp" alt="PALINDROME homepage: “The future has already left evidence.” beside a featured document dated 2113 and the SHIFT REALITY control" width="100%" />

</div>

<br />

## The archive

PALINDROME® catalogues **24 records** across **6 categories**, cross-referenced against **one consensus timeline and
three branching histories**. Every record is documentation, not proof — and every one of them is fiction.

- **Every identifier is a palindrome.** `OB-2112-BO`, `PL-0220-LP`, `DC-2442-CD` read the same in both directions.
  A test checks all of them.
- **Every image is drawn from data.** Contour maps, a city photographed in two different years, dials, waveforms,
  redacted documents, machine drawings, a lamp with two shadows — all generated as deterministic SVG. No stock
  photography, no remote images.
- **Nothing pretends.** Sharing, copying and saving report what actually happened; storage failures are shown, not
  hidden.

## Highlights

|                          |                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| **SHIFT REALITY**        | Swaps the featured anomaly, the timeline branch it is viewed from, the status readout and the URL. Shareable, survives reload. |
| **Archive explorer**     | Search across title, identifier, description and tags; category filters; three sort orders; grid or list; load-more. All state lives in the URL. |
| **Special inspections**  | A year slider across a split photograph, a document whose redactions can be lifted, a map with selectable coordinates, switchable viewing modes. |
| **Inspection mode**      | Full-screen viewer with zoom, drag-to-pan, plate / negative / spectral renderings and annotations. Keyboard-operable, focus returns on close. |
| **Branching timelines**  | A draggable chart on desktop and an accordion on mobile, roving keyboard focus, deep links to every event. |
| **Personal cabinet**     | Saved records and collections, recently viewed, JSON export and a confirmed clear-all — in `localStorage`, validated on read. |

## Gallery

<table>
  <tr>
    <td width="50%"><img src="docs/images/record.webp" alt="Record PL-0220-LP: Varnholm, 1931 / 2048 — a city skyline photographed half in 1931 and half in 2048" /></td>
    <td width="50%"><img src="docs/images/inspection.webp" alt="Inspection mode showing the Isle of Quell contour map in the spectral rendering with three annotations" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Record</b> — Varnholm, 1931 / 2048</sub></td>
    <td align="center"><sub><b>Inspection mode</b> — spectral rendering with annotations</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/images/archive.webp" alt="Archive explorer with category filters, sort control, view toggle and a grid of generated artworks" /></td>
    <td width="50%"><img src="docs/images/timelines.webp" alt="Branching timeline chart with the consensus line and three branches, event 2061 selected" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Archive</b> — search, filters, sort, grid / list</sub></td>
    <td align="center"><sub><b>Timelines</b> — one consensus line, three branches</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/images/layers.webp" alt="Read the layers: minutes of an unheld meeting with redactions and toggles for overtypes, marginalia and stamps" /></td>
    <td width="50%"><img src="docs/images/collection.webp" alt="Collection page: Cities That Never Existed, over a generated contour map" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Read the layers</b> — a document with lift-able redactions</sub></td>
    <td align="center"><sub><b>Collections</b> — curated paths through the archive</sub></td>
  </tr>
</table>

<table>
  <tr>
    <td width="33%"><img src="docs/images/mobile-home.webp" alt="Homepage on a phone" /></td>
    <td width="33%"><img src="docs/images/mobile-record.webp" alt="Record page on a phone" /></td>
    <td width="33%"><img src="docs/images/mobile-menu.webp" alt="Full-screen navigation menu on a phone" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Mobile — home</sub></td>
    <td align="center"><sub>Mobile — record</sub></td>
    <td align="center"><sub>Mobile — navigation</sub></td>
  </tr>
</table>

## Tech stack

| Layer      | Choice                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) App Router (Turbopack), React 19 Server Components      |
| Language   | TypeScript, `strict`                                                                     |
| Styling    | Tailwind CSS 4 (CSS-first `@theme` tokens) + hand-written CSS for art direction          |
| Motion     | [Motion](https://motion.dev) (`LazyMotion`), CSS scroll-driven animation as enhancement   |
| Validation | [Zod](https://zod.dev) — dataset integrity tests and `localStorage` parsing              |
| Icons      | [Lucide](https://lucide.dev)                                                             |
| Tests      | Vitest + Testing Library (jsdom)                                                         |
| Hosting    | [Vercel](https://vercel.com) — every push to `main` deploys to production                |

## Getting started

Requires **Node.js 20.9+** (developed on Node 24) and npm.

```bash
git clone https://github.com/NikitaMelnikit/palindrome-archive.git
cd palindrome-archive
npm install
npm run dev
```

Open <http://localhost:3000>.

| Command             | What it does                                             |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Development server (Turbopack)                           |
| `npm run build`     | Production build — prerenders 74 pages                   |
| `npm run start`     | Serve the production build                               |
| `npm run lint`      | ESLint (Next.js core-web-vitals + TypeScript rules)      |
| `npm run typecheck` | Generates route types, then `tsc --noEmit`               |
| `npm run test`      | Vitest — 72 tests                                        |
| `npm run check`     | lint → typecheck → test → build (what CI runs)           |

> `.npmrc` sets `legacy-peer-deps=true`: npm 11’s peer-set resolver crashes on this dependency tree (an arborist
> `edgesOut` bug). Every required peer is declared explicitly in `package.json`, so nothing is skipped.

## Routes

| Route                 | Rendering             | Purpose                                                                    |
| --------------------- | --------------------- | -------------------------------------------------------------------------- |
| `/`                   | static                | Hero with SHIFT REALITY, recent accessions, branching history, invitation  |
| `/archive`            | dynamic               | Search, filters, sort, grid / list, load-more — all state in the URL       |
| `/archive/[slug]`     | static × 24           | Record, inspection mode, special interaction, relations                    |
| `/timelines`          | dynamic               | Branching timeline explorer; `?event=` deep links                          |
| `/collections`        | static                | Collection index with category filtering                                   |
| `/collections/[slug]` | static × 6            | Curator’s note, index, records                                             |
| `/cabinet`            | static (client data)  | Saved records, recently viewed, JSON export, clear-all                     |
| `/about`              | static                | Manifesto, classification, documentation process, identifier anatomy       |

Plus a custom 404, error boundaries, `sitemap.xml`, `robots.txt`, a web manifest, SVG favicon, apple icon and
generated Open Graph images for the site, every record and every collection.

## Project structure

```
app/                 routes, metadata, OG images, global styles (design tokens in globals.css)
components/
  art/               procedural SVG generators (one per art kind) + dispatcher + frame
  layout/            header + mobile menu, footer, toaster, cursor layer, live clock, motion provider
  home/              homepage sections
  archive/           explorer, cards, rows
  artifacts/         actions, inspection mode, the four special interactions
  timeline/          explorer + layout geometry
  collections/       index + save button
  cabinet/           personal cabinet
  interactions/      shared primitives (segmented control, roving focus, text scramble)
data/                typed content: 24 artifacts, 6 collections, 4 timeline lines, categories
lib/                 data access, search, storage, SHIFT REALITY, sharing, formatting, hooks
types/               shared domain types
docs/images/         README screenshots
```

## Architecture notes

- **Content is data.** Records live in `data/`, and every relationship has one source of truth: collections own their
  membership, timeline events own theirs, and each artifact’s back-references are derived. A Zod-based integrity test
  validates the dataset and every cross-link.
- **Deterministic art.** Each record carries a `visualization` (kind, seed, variant). Generators use a seeded PRNG, so
  server and client render identical SVG; colours are CSS custom properties, so one drawing can be re-toned for
  inspection mode.
- **Server Components by default.** Client components are limited to real interactivity. `ArtifactArt` is a client
  boundary on purpose: pages ship its props in the RSC payload instead of a second copy of every SVG, which halved
  the HTML of art-heavy pages.
- **URL as state.** Archive filters, timeline selection and the shifted reality are all encoded in the URL, so back /
  forward, reloads and shared links behave.
- **Honest storage.** The cabinet is an external store over `localStorage` read with `useSyncExternalStore`. Corrupted
  data is backed up and reset with a visible notice; unavailable storage degrades to memory and says so.
- **Motion that never hides content.** Entrances are CSS and never delay LCP; Motion handles state transitions; all
  of it respects `prefers-reduced-motion`.

## Quality

Measured, not claimed — Lighthouse 13 against the live site on Vercel (11 Oct 2026):

| Page                        | Profile                  | Performance | Accessibility | Best practices | SEO |
| --------------------------- | ------------------------ | :---------: | :-----------: | :------------: | :-: |
| Home                        | desktop                  |     100     |      100      |      100       | 100 |
| Home                        | mobile, simulated slow 4G |     78      |      100      |      100       | 100 |
| Archive                     | mobile, simulated slow 4G |     91      |      100      |      100       | 100 |
| Timelines                   | mobile, simulated slow 4G |     89      |      100      |      100       | 100 |
| Record · Varnholm (3 runs)  | mobile, simulated slow 4G |   68 – 93   |      100      |      100       | 100 |

Cumulative Layout Shift is 0 on every page and mobile LCP is 2.7–3.2 s. Mobile performance scores swing between
runs because Total Blocking Time is measured on the auditing machine’s (throttled) CPU — the same record page scored
93, 77 and 68. The cabinet scores lower on SEO by design: it is `noindex`.

Also checked by hand in Chromium at 375–1440 px: keyboard navigation, focus management in dialogs, deep links,
back / forward, storage recovery and the absence of horizontal overflow.

## Deployment

The repository is connected to Vercel: every push to `main` builds and deploys to production, and pull requests get
preview deployments. No environment variables are required — canonical URLs, the sitemap and `robots.txt` use the
production domain Vercel exposes at build time (`VERCEL_PROJECT_PRODUCTION_URL`), which follows custom domains.
Set `NEXT_PUBLIC_SITE_URL` to override it, for example when hosting elsewhere.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNikitaMelnikit%2Fpalindrome-archive)

## Known limitations

- The cabinet is per browser (`localStorage`); there are no accounts and no sync.
- Mobile Lighthouse performance is limited mainly by framework JavaScript (hydration) under simulated slow 4G and
  a 4× CPU slowdown.
- Screen-reader support was checked through the accessibility tree and automated audits, not with a physical screen
  reader. Safari and Firefox have not been tested by hand.

## License

Code is released under the [MIT License](LICENSE).

<div align="center">
<br />
<sub>Every record, place, person and institution in this archive is fiction.<br />Any resemblance to a future you recognise is a filing error.</sub>
</div>
