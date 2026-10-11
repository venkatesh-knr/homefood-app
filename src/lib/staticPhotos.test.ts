import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Every photo a migration points at ('static/<file>.webp') must be a real file shipped in public/dish-photos/,
// or the app would show a broken image for that dish.
describe('bundled dish photos', () => {
  const migrations = join(process.cwd(), 'supabase/migrations')
  const wanted = new Map<string, string>()
  for (const f of readdirSync(migrations).filter((x) => x.endsWith('.sql'))) {
    for (const m of readFileSync(join(migrations, f), 'utf8').matchAll(/static\/([a-z0-9-]+\.webp)/g)) wanted.set(m[1]!, f)
  }

  it('finds the photo paths the migrations use', () => {
    expect(wanted.size).toBeGreaterThan(200)
  })

  it('has a file for every one of them', () => {
    const missing = [...wanted].filter(([file]) => !existsSync(join(process.cwd(), 'public/dish-photos', file))).map(([file, migration]) => `${file} (${migration})`)
    expect(missing).toEqual([])
  })

  it('keeps each photo small (a phone downloads these over mobile data)', () => {
    const big = [...wanted.keys()].filter((file) => existsSync(join(process.cwd(), 'public/dish-photos', file))).filter((file) => readFileSync(join(process.cwd(), 'public/dish-photos', file)).length > 300_000)
    expect(big).toEqual([])
  })
})
