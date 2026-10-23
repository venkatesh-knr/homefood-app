import { describe, expect, it } from 'vitest'
import { creditFor, isFreeLicence, parseCommonsResults, plainAuthor } from './webPhotos'

const page = (over: Record<string, unknown>, ii: Record<string, unknown> = {}) => ({
  title: 'File:Idli Sambar.jpg', index: 1,
  imageinfo: [{ thumburl: 'https://upload.wikimedia.org/x/960px-Idli.jpg', width: 3000, height: 2000, mime: 'image/jpeg', descriptionurl: 'https://commons.wikimedia.org/wiki/File:Idli.jpg',
    extmetadata: { LicenseShortName: { value: 'CC BY-SA 4.0' }, Artist: { value: '<a href="//x">Sutapa Pal</a>' } }, ...ii }],
  ...over,
})

describe('which licences are free enough', () => {
  it('accepts public domain, CC0, CC BY and CC BY-SA', () => {
    for (const l of ['CC0', 'Public domain', 'PD-self', 'CC BY 2.0', 'CC BY-SA 4.0', 'CC BY-SA 3.0', 'Attribution']) expect(isFreeLicence(l), l).toBe(true)
  })
  it('refuses non-commercial, no-derivatives, unknown and empty', () => {
    for (const l of ['CC BY-NC 4.0', 'CC BY-ND 2.0', 'CC BY-NC-SA 3.0', 'All rights reserved', 'Fair use', '']) expect(isFreeLicence(l), l).toBe(false)
  })
})

describe('credits', () => {
  it('turns the author HTML into plain text', () => {
    expect(plainAuthor('<a href="//commons.wikimedia.org/wiki/User:X" title="User:X">Sutapa&nbsp;Pal</a> &amp; friends')).toBe('Sutapa Pal & friends')
    expect(plainAuthor('x'.repeat(100))).toHaveLength(58)
  })
  it('writes the credit shown with the photo', () => {
    expect(creditFor('Sutapa Pal', 'CC BY-SA 4.0')).toBe('Sutapa Pal, CC BY-SA 4.0, via Wikimedia Commons')
    expect(creditFor('', 'CC0')).toBe('Unknown author, CC0, via Wikimedia Commons')
    expect(creditFor('', 'CC BY-SA 3.0', 'Idli.jpg')).toBe('File: Idli.jpg, CC BY-SA 3.0, via Wikimedia Commons')
  })
})

describe('reading a Commons search', () => {
  it('keeps free, full-size pictures in order and writes their credit', () => {
    const data = { query: { pages: {
      2: page({ title: 'File:Second.jpg', index: 2 }),
      1: page({ title: 'File:Idli Sambar.jpg', index: 1 }),
    } } }
    const r = parseCommonsResults(data)
    expect(r.map((p) => p.title)).toEqual(['Idli Sambar', 'Second'])
    expect(r[0]).toMatchObject({ licence: 'CC BY-SA 4.0', credit: 'Sutapa Pal, CC BY-SA 4.0, via Wikimedia Commons', thumbUrl: expect.stringContaining('upload.wikimedia.org') })
  })
  it('drops non-free licences, tiny pictures, and anything that is not a photo', () => {
    const data = { query: { pages: {
      1: page({ index: 1 }, { extmetadata: { LicenseShortName: { value: 'CC BY-NC 4.0' }, Artist: { value: 'A' } } }),
      2: page({ index: 2 }, { width: 300, height: 200 }),
      3: page({ index: 3 }, { mime: 'image/svg+xml' }),
      4: page({ index: 4 }, { extmetadata: {} }),
      5: page({ index: 5, title: 'File:Good.png' }, { mime: 'image/png' }),
    } } }
    expect(parseCommonsResults(data).map((p) => p.title)).toEqual(['Good'])
  })
  it('copes with an empty or odd answer', () => {
    expect(parseCommonsResults({})).toEqual([])
    expect(parseCommonsResults(null)).toEqual([])
    expect(parseCommonsResults({ query: {} })).toEqual([])
  })
  it('stops at the limit', () => {
    const pages = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [i, page({ index: i + 1, title: `File:P${i}.jpg` })]))
    expect(parseCommonsResults({ query: { pages } }, 3)).toHaveLength(3)
  })
})
