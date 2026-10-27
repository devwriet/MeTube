# MeTube class names

Use these exact names in wireframes and UI files. The site code finds elements by these names.
Sizes come from measuring youtube.com (2026-10-20). Colors: only `var(--...)` from `css/tokens.css`.

## Naming rules

1. Lowercase letters and hyphens only: `card-title`. No capitals, no underscores.
2. Pattern: `thing` or `thing-part`. The first word is the component. Example: `card`, `card-thumb`.
3. A state is a second class with the suffix `-active`: `chip chip-active`.
4. Use the names below. Need a new name? Ask the team first. Do not invent your own.
5. No inline `style=""`. No `id` for styling.
6. Pages are `home.html`, `watch.html`, `shorts.html`, `profile.html`.

## Shared on every page

| Class | What it is | Size / note |
| --- | --- | --- |
| `header` | Top bar, fixed | 56 px high |
| `header-left` | Menu button and logo | |
| `header-right` | Create, bell, avatar | |
| `logo` | "MeTube" text with the `Me` box | |
| `search` | Search form (input and button) | centered, up to 640 px |
| `search-input` | Text field | 40 px high, round left |
| `search-button` | Magnifier button | 64 px wide (44 px on phones), round right |
| `icon-button` | Round icon-only button | 40 px |
| `icon` | Inline SVG icon (copy from `media/icons/`) | 24 px, takes the text color; add `aria-hidden="true"` |
| `avatar` | Round picture or letter | `avatar-sm` 32, `avatar-md` 36, `avatar-lg` 160 |
| `guide` | Left sidebar | 240 px wide; `guide-mini` is 72 px |
| `guide-item` | One sidebar link | 40 px high (64 px inside `guide-mini`, icon above label); `guide-item-active` for the current page |
| `page` | Main area right of the sidebar | |
| `button` | Base pill button | 36 px high |
| `button-subscribe` | Subscribe | fill `--text`, text `--bg` |
| `button-subscribed` | Subscribed (after click) | fill `--field-btn`, border `--field-line` |

## Video card and grid (Home, Profile, search results)

| Class | What it is | Size / note |
| --- | --- | --- |
| `video-grid` | Grid of cards | 4 columns wide, 3 medium, 2 small, 1 on phones (650 px or less); 16 px column gap, 40 px row gap |
| `card` | One video (a link) | |
| `card-thumb` | Thumbnail box | 16:9, 12 px radius |
| `card-duration` | Time badge on the thumbnail | bottom right |
| `card-body` | Row under the thumbnail | avatar plus text |
| `card-avatar` | Channel picture (`avatar-md`) | not shown on Profile |
| `card-title` | Video title | 16 px, 2 lines max |
| `card-channel` | Channel name | secondary color |
| `card-stats` | "37K views · 3 days ago" | secondary color |

## Home

| Class | What it is | Size / note |
| --- | --- | --- |
| `chips` | Category bar under the header | 56 px high, sticky |
| `chip` | One category button | 32 px high, 8 px radius |
| `chip-active` | The selected category | fill `--text`, text `--bg` |

Home = `header` + `guide` + `page` containing `chips` and `video-grid`.

## Watch

| Class | What it is | Size / note |
| --- | --- | --- |
| `watch-layout` | Two columns | |
| `watch-primary` | Left column | player, info, comments |
| `watch-secondary` | Right column | 320 px; related videos |
| `player` | Video area | 16:9 |
| `watch-title` | Video title | large |
| `channel-row` | Avatar, name, subs, Subscribe | one line |
| `channel-name` | Channel name | |
| `channel-subs` | "48.3K subscribers" | secondary color |
| `watch-actions` | Like, Share, Save row | |
| `action-button` | One pill in that row | |
| `description-box` | Views, date, description | grey box (`--chip`) |
| `comments` | Whole comments block | |
| `comments-count` | "128 Comments" | |
| `comment-form` | Add-comment area | |
| `comment-input` | Text field | |
| `comment-list` | List of comments | |
| `comment` | One comment | |
| `comment-avatar` | Picture (`avatar-md`) | |
| `comment-body` | Text column | |
| `comment-author` | Name | |
| `comment-time` | "2 days ago" | secondary color |
| `comment-text` | The comment | |
| `comment-like` | Like button and count | |
| `related-list` | List in the right column | |
| `related-card` | One row | thumbnail left, text right |
| `related-thumb` | Small thumbnail | 16:9 |
| `related-title` | Title | |
| `related-channel` | Channel name | |
| `related-stats` | Views and age | |

## Shorts

| Class | What it is | Size / note |
| --- | --- | --- |
| `shorts-feed` | Scrolling list, one short per screen | snaps to each short |
| `short` | One short | |
| `short-player` | Vertical video | 9:16, about 378 × 672 |
| `short-overlay` | Text over the bottom of the video | |
| `short-channel` | Channel name and Subscribe | |
| `short-title` | Title | |
| `short-rail` | Buttons at the right side | |
| `rail-button` | Like, Comment, Share | round |
| `rail-count` | Number under a button | |

## Profile

| Class | What it is | Size / note |
| --- | --- | --- |
| `banner` | Wide picture at the top | 138 px high, 16 px radius |
| `profile-header` | Avatar and text | |
| `profile-avatar` | Big picture (`avatar-lg`) | 160 px (96 px on phones) |
| `profile-name` | Channel name | 36 px, bold (28 px on phones) |
| `profile-handle` | `@deepfake` | |
| `profile-stats` | Subscribers and video count | secondary color |
| `profile-bio` | Short text | |
| `tabs` | Tab bar | 48 px high |
| `tab` | One tab | |
| `tab-active` | Current tab | underline 2 px |

Profile = `header` + `guide-mini` + `page` containing `banner`, `profile-header`, `tabs`, and a `video-grid` of `card`.

## Not in this list on purpose

Upload, login, settings, live chat, playlists. The site is a mockup.
