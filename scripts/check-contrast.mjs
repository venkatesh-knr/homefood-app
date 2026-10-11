// Checks the colour pairs the app really uses against WCAG AA, in light and dark mode, straight from the tokens in src/index.css.
// Run from the repo root:  node scripts/check-contrast.mjs        (exits 1 if a pair fails)
// Text needs 4.5:1 (3:1 for large text); borders and focus rings that identify a control need 3:1.
import { readFileSync } from 'node:fs'

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

function tokens(block) {
  const out = {}
  for (const m of block.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})/g)) out[m[1]] = m[2]
  return out
}
const light = tokens(css.slice(css.indexOf('@theme'), css.indexOf('/* Dark mode')))
const darkBlock = css.slice(css.indexOf(':root[data-theme="dark"]'), css.indexOf('[data-theme="light"] {'))
const dark = { ...light, ...tokens(darkBlock) }

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [foreground token (or #hex), background token (or #hex), what it is, minimum ratio]
const TEXT = 4.5
const UI = 3
const pairs = [
  ['ink', 'cream', 'body text', TEXT], ['ink', 'surface', 'text on cards', TEXT], ['ink', 'sand', 'text on chips', TEXT],
  ['ink-soft', 'cream', 'secondary text', TEXT], ['ink-soft', 'surface', 'secondary text on cards', TEXT], ['ink-soft', 'sand', 'secondary text on chips', TEXT],
  ['muted', 'cream', 'hint text', TEXT], ['muted', 'surface', 'hint text on cards', TEXT], ['muted', 'sand', 'hint text on chips', TEXT],
  ['saffron-ink', 'cream', 'links and tab labels', TEXT], ['saffron-ink', 'surface', 'links on cards', TEXT], ['saffron-ink', 'saffron-tint', 'tips and notes', TEXT], ['saffron-ink', 'sand', 'links on chips', TEXT],
  ['ink', 'saffron-tint', 'text in tips', TEXT], ['on-saffron', 'saffron', 'text on saffron buttons and badges', TEXT],
  ['cream', 'ink', 'text on dark buttons', TEXT],
  ['leaf', 'leaf-tint', 'agree / success text', TEXT], ['leaf', 'cream', 'success text', TEXT], ['leaf', 'surface', 'success text on cards', TEXT],
  ['alert', 'alert-tint', 'error text', TEXT], ['alert', 'cream', 'error text', TEXT], ['alert', 'surface', 'error text on cards', TEXT],
  ['dinner-ink', 'dinner-tint', 'dinner suggestion text', TEXT],
  ['on-solid', 'alert', 'text on red buttons', TEXT], ['on-solid', 'leaf', 'ticks on green', TEXT], ['#ffffff', 'meal-dinner', 'white on dinner buttons and poster', TEXT], ['#ffffff', 'meal-lunch', 'white on the lunch poster block', TEXT], ['on-saffron', 'meal-breakfast', 'dark text on the breakfast poster block', TEXT], ['on-saffron', 'meal-snacks', 'dark text on the snacks poster block', TEXT],
  ['line-strong', 'surface', 'input and button borders', UI], ['line-strong', 'cream', 'borders on the page', UI],
  ['saffron-ink', 'cream', 'focus ring on the page', UI], ['saffron-ink', 'surface', 'focus ring on cards', UI], ['saffron-ink', 'sand', 'focus ring on chips', UI],
]

const colour = (modeTokens, t) => (t.startsWith('#') ? t : modeTokens[t])
let failed = 0
for (const [name, tk] of [['light', light], ['dark', dark]]) {
  console.log(`\n${name} mode`)
  for (const [fg, bg, what, min] of pairs) {
    const a = colour(tk, fg)
    const b = colour(tk, bg)
    const r = ratio(a, b)
    const ok = r >= min
    if (!ok) failed++
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1  (need ${min})  ${what}: ${fg} ${a} on ${bg} ${b}`)
  }
}
console.log(failed === 0 ? '\nAll pairs pass.' : `\n${failed} pair(s) below the minimum.`)
process.exit(failed === 0 ? 0 : 1)
