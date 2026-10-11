# Accessibility report (12 Oct 2026)

What was checked, what was fixed, and what is still open. Target: WCAG 2.1 AA, on a phone (375 px) in English and Tamil, light and dark.

## How it was checked

| Check | How | Re-run with |
| --- | --- | --- |
| Colour contrast, every pair the app uses, light and dark | `scripts/check-contrast.mjs` reads the tokens in `src/index.css` | `node scripts/check-contrast.mjs` (`npm run contrast`) |
| Names, headings, touch targets, images, horizontal scroll | A small script run on 16 screens of the demo home at 375 px (fields without a label, buttons without a name, targets under 44 px, images without `alt`, missing `h1`, page wider than the screen) | `scripts/a11y-audit.js` in the browser console |
| Reflow | The same 16 screens at 320 px wide (what 400 % zoom on a 1280 px screen gives), English and Tamil: no horizontal scrolling | as above |
| Dialogs | The dish picker and the "Cook this again" sheet driven with Tab and Escape: Tab stays inside, Escape closes, focus goes in and (when the opener still exists) back | by hand |

The audit snippet is `scripts/a11y-audit.js`: paste it into the browser console on any screen and call `window.__audit()`.

## Fixed

- **Contrast.** Light mode already passed for all text. Fixed: the focus ring (saffron was 2.3–2.7:1, now the darker saffron ink, 5:1+); input and button borders (1.7–1.8:1 in light, 2:1 in dark; now 3:1+, so a field's edge can be seen); dark mode text on saffron and on red/green blocks (light text on light blocks; new tokens `on-saffron` and `on-solid`); the poster's breakfast and snacks blocks now use dark text.
- **Touch targets.** Every button, field and select is at least 44 × 44 px (one rule in `src/index.css`; switches keep their look and get a larger invisible hit area). The week strip was re-spaced so seven days still fit at 375 px.
- **Names.** Search boxes, the filter selects, the comment box, the Add-dish form (labels now tied to their fields) and the chip fields have names; the chip "×" buttons say what they remove.
- **Headings.** Every screen has one `h1` (Dishes and Home have a visually hidden one).
- **Dialogs.** The dish picker and the photo viewer now use the shared `Dialog` (focus trap, Escape closes, focus returns).
- **Announcements.** Error messages are `role="alert"`; progress and success messages are `role="status"`; the person's amount, goals and the protein card update politely.
- **Tamil.** Tamil text shown inside an English screen carries `lang="ta"` (right voice and font).
- **Motion.** `prefers-reduced-motion` switches off animations and transitions.
- **Zoom.** No horizontal scrolling at 320 px in English or Tamil on 16 screens.

## Still open (be honest, not hidden)

- **Real screen-reader testing** (TalkBack, VoiceOver) has not been done by a person; only the structure was checked.
- **A full keyboard walkthrough** was done for the dialogs and the new screens, not for every control on every screen.
- **Dish photos** are decorative in lists (`alt=""`, the dish name is next to them) and have the dish name in the viewer; the placeholder letters are hidden from screen readers.
- **Focus return** after a dialog closes is lost when the button that opened it was re-created while the dialog was open (seen on the slot editor's "Change").
- **The poster** (Week at a glance) is an image when saved: it has no text alternative beyond the page itself.
- **Text-only zoom to 200 %** (browser text size, not page zoom) was not separately tested; fixed pixel sizes are used for most text.
- **Swipe-only gestures** do not exist; everything has a button.
