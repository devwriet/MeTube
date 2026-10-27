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
| `search-input` | Text field | 40 px high, 16 px text, round left |
| `search-button` | Magnifier button | 64 px wide, icon centered, round right; on phones the field stays visible and the button is 44 px (youtube.com collapses it to a 40 px icon below 657 px; we keep the field for our own search feature) |
| `icon-button` | Round icon-only button | 40 px |
| `icon` | Inline SVG icon (copy from `media/icons/`) | 24 px, takes the text color; add `aria-hidden="true"` |
| `avatar` | Round picture or letter | `avatar-xs` 24 (sidebar channels), `avatar-sm` 32, `avatar-md` 36, `avatar-lg` 160 |
| `guide` | Left sidebar | 240 px wide; `guide-mini` is 72 px; hidden at 791 px or less (tablet and phone). `guide-drawer` = always hidden (Watch); `guide-open` = the menu button shows it as a 240 px overlay at <=1312 px and on Watch at every width, with `guide-scrim` behind it |
| `guide-item` | One sidebar link | 40 px high (76 px inside `guide-mini`, icon above an 11 px label; youtube.com uses 10 px, below our 11 px readability floor); `guide-item-active` for the current page |
| `guide-more` | Everything below Home and Shorts in the wide sidebar | hidden in mini mode |
| `guide-mini-only` | 구독 and 나 entries | shown only in mini mode |
| `guide-heading` | Section title (구독, 나, 탐색) | 16 px, weight 500; a link with a chevron when it opens a page |
| `guide-links` | Footer text links (소개, 저작권 ...) | 13 px, wraps |
| `guide-link` | One footer text link | placeholder |
| `guide-copy` | Footer copyright line | 12 px |
| `page` | Main area right of the sidebar | |
| `page-title` | The page's `h1` when the design shows no title (Home, Watch "not found") | hidden on screen, read by screen readers |
| `sr-only` | Visually hidden text that remains available to screen readers | |
| `page-message` | Message instead of content: no search results, video not found, data failed to load | centered, secondary color, 16 px |
| `button` | Base pill button | 40 px high, bold 500 |
| `button-subscribe` | Subscribe | fill `--text`, text `--bg` |
| `button-subscribed` | Subscribed (after click) | fill `--field-btn`, border `--field-line` |

## Video card and grid (Home, Profile, search results)

| Class | What it is | Size / note |
| --- | --- | --- |
| `video-grid` | Grid of cards | 4 columns wide, 3 medium, 2 small, 1 on phones (650 px or less); 16 px column gap, 40 px row gap |
| `card` | One video box with separate video and channel links | |
| `card-link` | Thumbnail link to the video | |
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
| `watch-secondary` | Right column | max(402 px, 27.5vw); related videos; below 1000 px it goes under the player |
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
| `related-thumb` | Thumbnail | 16:9; desktop width min(62%, 235 px); title up to 3 lines |
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
| `banner` | Wide picture at the top | ratio about 6.2 : 1 (1284 px wide = 207 px high, 374 px wide = 60 px high), 16 px radius (8 px on phones) |
| `profile-header` | Avatar and text | |
| `profile-avatar` | Big picture (`avatar-lg`) | 160 px; 120 px at 839 px or less; 72 px at 599 px or less |
| `profile-name` | Channel name | 36 px / 50 px line, bold (24 px / 32 px on phones) |
| `profile-handle` | `@deepfake` | |
| `profile-stats` | Subscribers and video count | secondary color |
| `profile-bio` | Short text | |
| `tabs` | Tab bar | 48 px high, 24 px between tabs, 16 px labels |
| `tab` | One tab | |
| `tab-active` | Current tab | underline 2 px, `--text` color |

Profile (`profile.html?c=<channel id>`, built by `js/profile.js` from `data/videos.json`) = `header` + `guide` + `page` containing `banner`, `profile-header`, `tabs`, and one `tab-panel` per tab (only the selected one is shown).

On Profile the `video-grid` is 3 columns from 1171 px, 2 from 671 to 1170 px, 1 below, with a 32 px row gap (the 4/3/2/1 rule above is for Home). The channel-search button next to the tabs is 48 px.

Tabs: Home, Videos, Shorts, Playlists, About. JS switches the panels, so `tab` is a button with `role="tab"`.

| Class | What it is | Size / note |
| --- | --- | --- |
| `profile-wrap` | Width wrapper for the whole profile | steps like youtube.com: 642 px from 671, 856 from 957, 1070 from 1171, back to 856 from 1313 (the wide sidebar takes room), 1070 from 1339, 1284 from 1553; full width below 671 |
| `profile-info` | Text column next to the avatar (name, meta, bio, button) | |
| `profile-meta` | One line: `@handle · subscribers · videos` | holds `profile-handle` and `profile-stats` |
| `tabs-bar` | Full-width sticky strip behind the tabs (draws the divider line across the page) | sticks 56 px from the top; holds one `profile-wrap tabs` |
| `tablist` | Wrapper around the tab buttons (the search icon sits next to it inside `tabs`) | 24 px between tabs |
| `playlist-grid` | Playlists tab: grid of 210 px cards | add next to `video-grid`; 4 px column gap |
| `tab-panel` | Content of one tab | `hidden` on the others |
| `section-heading` | Heading inside a panel ("Latest") | 20 px, bold |
| `shelf` | Home tab: one row that scrolls sideways | cards 210 px wide; `shelf-wide` makes them 354 px, at most 85% of the row |
| `chips-end` | Chip row pushed to the right (Playlists "Sort by") | add next to `chips` |
| `profile-actions` | Row with Subscribe and Community | 8 px gap, buttons 40 px high |
| `button-secondary` | Grey pill button (Community) | fill `--field-btn`, text `--text` |
| `card-menu` | Button that opens the card action menu | 40 px round target, 24 px icon; hidden until hover on mouse devices |
| `menu` | Shared card action menu | Fixed overlay; max-height calc(100dvh - 16px), scrolls when needed; bottom sheet on phones |
| `menu-item` | One action in the card menu | 36 px high; 48 px on phones |
| `toast` | Action feedback message | Fixed near the bottom of the screen |
| `toast-action` | Optional action in a toast | Accent-colored button |
| `short-grid` | Shorts tab: grid of tiles | add next to `video-grid`; columns at least 200 px, 4 px gap, 2 columns on phones |
| `short-tile` | One short in that grid | add next to `card`; thumbnail is 2:3 (as on youtube.com), 8 px radius |
| `playlist-card` | Playlist card | add next to `card`; stacked lines above the thumbnail |
| `about` | About tab text block | max 720 px |

## Not in this list on purpose

Upload, login, settings, live chat, playlists. The site is a mockup.
