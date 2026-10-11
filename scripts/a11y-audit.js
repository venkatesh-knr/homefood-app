// Paste into the browser console on any HomeFood screen (the demo home is handy). Lists: fields without a name, buttons/links without a name,
// touch targets under 44 px, images without alt, a missing h1, and a page wider than the screen. Run: window.__audit()
window.__audit = () => {
  const name = (el) => (el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') && document.getElementById(el.getAttribute('aria-labelledby'))?.textContent) || el.labels?.[0]?.textContent || el.getAttribute('title') || el.textContent || el.getAttribute('placeholder') || '').trim()
  const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' }
  const issues = []
  document.querySelectorAll('input:not([type=hidden]):not([type=file]), select, textarea').forEach((el) => { if (visible(el) && !(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.labels?.length)) issues.push('unlabelled field: ' + (el.placeholder || el.className.slice(0, 30))) })
  document.querySelectorAll('button, a[href], [role=button]').forEach((el) => {
    if (!visible(el)) return
    if (!name(el)) issues.push('no name: ' + el.outerHTML.slice(0, 80))
    const r = el.getBoundingClientRect()
    if ((r.width < 43.5 || r.height < 43.5) && !el.closest('[role=progressbar]') && el.getAttribute('role') !== 'switch') issues.push(`small target ${Math.round(r.width)}x${Math.round(r.height)}: ${name(el).slice(0, 30)}`)
  })
  document.querySelectorAll('img').forEach((el) => { if (visible(el) && el.getAttribute('alt') === null) issues.push('img without alt') })
  if (!document.querySelector('h1')) issues.push('no h1')
  if (document.documentElement.scrollWidth > window.innerWidth + 1) issues.push('horizontal scroll ' + document.documentElement.scrollWidth)
  return [...new Set(issues)]
}
