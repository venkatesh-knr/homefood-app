import { beforeEach, describe, expect, it, vi } from 'vitest'

function fakeStorage() {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  }
}

async function load() {
  vi.resetModules()
  const tips = await import('./tips')
  const demo = await import('../demo/demoState')
  return { tips, demo }
}

describe('first-visit tips', () => {
  let storage: ReturnType<typeof fakeStorage>
  beforeEach(() => {
    storage = fakeStorage()
    vi.stubGlobal('localStorage', storage)
  })

  it('shows a tip until it is dismissed, and remembers that on this device', async () => {
    const { tips } = await load()
    expect(tips.isTipSeen('today')).toBe(false)
    tips.dismissTip('today')
    expect(tips.isTipSeen('today')).toBe(true)
    expect(tips.isTipSeen('week')).toBe(false)
    expect(storage.data.get('homefood.tip.today')).toBe('1')

    const again = await load() // a later visit
    expect(again.tips.isTipSeen('today')).toBe(true)
  })

  it('"Show tips again" brings every tip back', async () => {
    const { tips } = await load()
    for (const id of tips.TIP_IDS) tips.dismissTip(id)
    tips.resetTips()
    for (const id of tips.TIP_IDS) expect(tips.isTipSeen(id)).toBe(false)
    expect([...storage.data.keys()].filter((k) => k.startsWith('homefood.tip.'))).toEqual([])
  })

  it('keeps the demo home from writing anything, and gives the device its own choices back afterwards', async () => {
    const { tips, demo } = await load()
    tips.dismissTip('home')
    demo.setDemoActive(true)
    tips.setTipsForDemo(true)
    expect(tips.isTipSeen('home')).toBe(false) // the demo starts with every tip unseen
    tips.dismissTip('today')
    expect(storage.data.has('homefood.tip.today')).toBe(false)
    demo.setDemoActive(false)
    tips.setTipsForDemo(false)
    expect(tips.isTipSeen('home')).toBe(true)
    expect(tips.isTipSeen('today')).toBe(false)
  })

  it('still works when storage is blocked', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })
    const { tips } = await load()
    expect(tips.isTipSeen('today')).toBe(false)
    tips.dismissTip('today')
    expect(tips.isTipSeen('today')).toBe(true)
  })
})
