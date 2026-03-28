# TUNEIN — Music Player

A browser-based music player with a genre quiz onboarding experience. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build step.

## Features

- **Genre quiz** — on first load, pick your preferred genres; the accent colour and greeting personalise to your selection
- **Snap-scroll sections** — Home, Popular, New Releases, Artists, Genres each fill the viewport and snap into place
- **Waveform seek bar** — the progress bar is rendered as animated waveform bars in both the player bar and the now-playing overlay
- **Now Playing overlay** — click the spinning vinyl to open a full-screen overlay with a rotating disc, blurred album art background, and track controls
- **Favourites** — heart any track; persisted to `localStorage`
- **Shuffle & repeat** — standard playback modes (repeat all, repeat one)
- **Ambient glow** — the player bar pulses with a radial glow when music is playing, implemented with CSS `:has()` — no JavaScript

## Project Structure

```
Music-Player/
├── index.html       # App shell + quiz markup
├── style.css        # All styles (quiz, layout, player, overlay)
├── app.js           # Playback logic, render functions, quiz flow
└── data/
    └── songs.js     # SONGS array and GENRE_COLORS map
```

## Running Locally

Open `index.html` directly in any modern browser. No server or install required.

> Audio streams from [SoundHelix](https://www.soundhelix.com) and cover art from [Picsum Photos](https://picsum.photos) — both require an internet connection.

## Tech Stack

| Layer      | Choice                          |
|------------|---------------------------------|
| Markup     | Semantic HTML5                  |
| Styling    | CSS custom properties, `@keyframes`, CSS `:has()` |
| Logic      | Vanilla JS (ES2020)             |
| Fonts      | Playfair Display, Outfit, Space Mono (Google Fonts) |
| Audio      | HTML `<audio>` element          |
| Storage    | `localStorage` (favourites)     |

## Key Design Decisions

- **`GENRE_META`** is defined at the top of `app.js` so both `renderGenres()` and the quiz can reference it without timing issues
- The quiz runs on every page load (no session gating) so it's easy to demo
- CSS `--acc` is a single variable that controls every accent throughout the UI — updating it from the quiz personalises the entire app in one line
- The waveform is generated with a seeded LCG random function so bar heights are deterministic and consistent across re-renders
