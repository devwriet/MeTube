# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary judge:** the Applied Screen instructor, who grades the project.
- **Live audience:** classmates watching the team "deepfake" demo the site in class on Fri 2026-11-06 (confirmed deadline).
- **Later viewers:** people Srit shows it to as a portfolio piece (personal site, applications), so quality beyond the grade matters.

## Product Purpose

MeTube is a working YouTube mockup: Home, Watch, Shorts and Profile pages with real interactions, built as a team school project. Success means a strong grade, a demo that works live with no dead ends, and a piece worth showing afterwards.

## Positioning

The look is the exact inverse (255 minus each channel) of YouTube's light theme, so the site is dark, with Srit's own accent `#0013de` instead of the mathematical inverse. Layout sizes and breakpoints are measured from youtube.com, not guessed.

## Operating Context

- Demoed live in a classroom, likely on a projector or a laptop screen, and also opened on phones and tablets.
- Teammates (two, Korean readers) contribute wireframes and components via Google Drive; only Srit uses Git. Teammates receive only `GUIDE-ko.md`, `css/tokens.css` and `CLASSES.md`.
- The instructor allows AI if the creator can explain the overall workflow.

## Capabilities and Constraints

- **Stack:** plain HTML, CSS and vanilla ES modules. No frameworks, no bundler or build step (mentor ruling, 2026-10-26). `fetch` of static JSON is allowed.
- **Grading priority:** JS features and their depth come first (mentor: "use JS to its fullest", no limit on feature count). Visual fidelity to YouTube is the baseline, not the main score.
- **Data:** `data/videos.json` (21 channels, 24 videos: 16 videos and 8 shorts; real titles, counts and dates from the source videos, real 20-second 1080p clips and thumbnails credited in `media/SOURCES.md`; the guest's own channel `ch-woopi` has no videos and comments start empty), guest state in `localStorage` under `metube:` keys.
- **Working features:** feeds and categories, search, watch page with likes, comments and subscriptions, watch later, history, liked list, card ⋮ menu with hide and undo, Shorts snap feed with comments panel, Profile tabs, sidebar drawer, toasts.
- **Every feature ships with tablet and phone layouts.**
- **Undecided:** theme toggle and top loading bar are deferred; whether an external login or backend counts is not yet asked.

## Brand Commitments

- Name **MeTube**, team name **deepfake**.
- UI copy and code comments in Korean; code identifiers in English.
- Accent `#0013de` is Srit's choice and binding; the inverse palette concept is binding.

## Evidence on Hand

- Video titles, channels, counts and dates come from the team's real YouTube picks (public metadata); the clips are 20-second excerpts used only for this class project (see `media/SOURCES.md`). The guest's own channel and every comment are authored mock data.
- Clips are loaded as Blobs (`js/clip.js`) so seeking works on a static server without Range support.
- YouTube measurements live in session reports (not in the repo); `CLASSES.md` records the resulting numbers.

## Product Principles

1. Features over decoration: a new working interaction beats a visual flourish.
2. Match YouTube's measured behavior and sizes; invert only the colors.
3. No dead ends in a live demo: every visible control works or says clearly that it is not ready (the "준비 중" toast).
4. Phone and tablet are first-class, not afterthoughts.
5. Keep it explainable: plain code a student can walk through in front of the instructor.

## Accessibility & Inclusion

No graded standard. Good practice is required: keyboard reachable controls, visible focus, sufficient contrast, 44px tap targets on phones, `prefers-reduced-motion` respected.
