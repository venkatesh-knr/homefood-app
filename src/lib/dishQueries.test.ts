import { existsSync, readFileSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { staticPhotoUrl } from './dishQueries'

describe('staticPhotoUrl', () => {
  it('maps a bundled catalogue photo to the app\'s own address', () => {
    expect(staticPhotoUrl('static/masala-dosa.webp')).toBe(`${import.meta.env.BASE_URL}dish-photos/masala-dosa.webp`)
  })
  it('leaves uploads and external links to the other paths', () => {
    expect(staticPhotoUrl('9f1c/abc.jpg')).toBeNull()
    expect(staticPhotoUrl('https://upload.wikimedia.org/x.jpg')).toBeNull()
  })
})

describe('bundled dish photos', () => {
  const manifest: { dish: string; file: string; credit: string; bytes: number }[] = JSON.parse(
    readFileSync('scripts/dish-photos.json', 'utf-8'),
  )
  it('has a photo and a credit for all 138 seeded dishes', () => {
    expect(manifest).toHaveLength(138)
    expect(new Set(manifest.map((m) => m.dish)).size).toBe(138)
    for (const m of manifest) expect(m.credit.length).toBeGreaterThan(5)
  })
  it('ships every file, each a reasonable size', () => {
    for (const m of manifest) {
      const path = `public/dish-photos/${m.file}`
      expect(existsSync(path), path).toBe(true)
      expect(statSync(path).size, path).toBeLessThan(400 * 1024)
    }
  })
  it('is what migration 0014 points the dishes at', () => {
    const sql = readFileSync('supabase/migrations/0014_dish_photos_static.sql', 'utf-8')
    for (const m of manifest) expect(sql).toContain(`'static/${m.file}'`)
  })
})
