import { describe, expect, it } from 'vitest'
import en from './en.json'
import ta from './ta.json'

type Tree = { [k: string]: string | Tree }

function keys(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([k, v]) =>
    typeof v === 'string' ? [prefix + k] : keys(v, prefix + k + '.'),
  )
}

function placeholders(tree: Tree): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  const walk = (t: Tree, p: string) => {
    for (const [k, v] of Object.entries(t)) {
      if (typeof v === 'string') out[p + k] = (v.match(/{{\s*\w+\s*}}/g) ?? []).map((s) => s.replace(/\s/g, '')).sort()
      else walk(v, p + k + '.')
    }
  }
  walk(tree, '')
  return out
}

describe('translations', () => {
  it('Tamil has exactly the same keys as English', () => {
    expect(keys(ta as Tree).sort()).toEqual(keys(en as Tree).sort())
  })

  it('every Tamil string keeps the same {{placeholders}}', () => {
    expect(placeholders(ta as Tree)).toEqual(placeholders(en as Tree))
  })

  it('no string is empty', () => {
    const leaves = (t: Tree): string[] => Object.values(t).flatMap((v) => (typeof v === 'string' ? [v] : leaves(v)))
    for (const tree of [en, ta] as Tree[]) {
      for (const v of leaves(tree)) expect(v.trim().length).toBeGreaterThan(0)
    }
  })
})
