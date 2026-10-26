import { describe, expect, it } from 'vitest'
import { aspectRatio, clampCrop, frameSize, MAX_ZOOM, moveLimits, outputSize, sourceRect } from './photoCrop'

describe('the frame', () => {
  it('has the shape asked for, and "whole" follows the photo', () => {
    expect(aspectRatio('square', 4000, 3000)).toBe(1)
    expect(aspectRatio('wide', 4000, 3000)).toBeCloseTo(4 / 3)
    expect(aspectRatio('banner', 4000, 3000)).toBeCloseTo(16 / 9)
    expect(aspectRatio('whole', 4000, 3000)).toBeCloseTo(4 / 3)
    expect(aspectRatio('whole', 3000, 4000)).toBeCloseTo(3 / 4)
  })
  it('is as wide as the space allows and is narrowed when it would be too tall', () => {
    expect(frameSize(1, 360, 600)).toEqual({ width: 360, height: 360 })
    expect(frameSize(3 / 4, 360, 400)).toEqual({ width: 300, height: 400 })
    expect(frameSize(16 / 9, 360, 600)).toEqual({ width: 360, height: 203 })
  })
})

describe('moving and zooming the photo under the frame', () => {
  it('at zoom 1 a photo exactly the frame shape cannot be moved at all', () => {
    expect(moveLimits(400, 300, 360, 270, 1)).toMatchObject({ x: 0, y: 0 })
  })
  it('a wide photo in a square frame can be moved sideways only', () => {
    const l = moveLimits(400, 300, 300, 300, 1)
    expect(l.x).toBeCloseTo(50)
    expect(l.y).toBe(0)
  })
  it('zooming in gives room to move', () => {
    expect(moveLimits(400, 300, 300, 300, 2).y).toBeCloseTo(150)
  })
  it('never lets the photo leave the frame empty, nor the zoom go out of range', () => {
    const c = clampCrop({ zoom: 99, ox: 9999, oy: -9999 }, 400, 300, 300, 300)
    expect(c.zoom).toBe(MAX_ZOOM)
    const l = moveLimits(400, 300, 300, 300, MAX_ZOOM)
    expect(c.ox).toBeCloseTo(l.x)
    expect(c.oy).toBeCloseTo(-l.y)
    expect(clampCrop({ zoom: 0.2, ox: 5, oy: 5 }, 300, 300, 300, 300).zoom).toBe(1)
  })
})

describe('which part of the photo is saved', () => {
  it('the middle of the photo when it has not been moved, covering the short side', () => {
    const r = sourceRect({ zoom: 1, ox: 0, oy: 0 }, 400, 300, 300, 300)
    expect(r.sw).toBeCloseTo(300)
    expect(r.sh).toBeCloseTo(300)
    expect(r.sx).toBeCloseTo(50)
    expect(r.sy).toBeCloseTo(0)
  })
  it('the whole photo for the "whole photo" frame at zoom 1', () => {
    const r = sourceRect({ zoom: 1, ox: 0, oy: 0 }, 400, 300, 400, 300)
    expect(r).toEqual({ sx: 0, sy: 0, sw: 400, sh: 300 })
  })
  it('dragging the photo to the right shows more of its left side', () => {
    const r = sourceRect({ zoom: 1, ox: 50, oy: 0 }, 400, 300, 300, 300)
    expect(r.sx).toBeCloseTo(0)
  })
  it('zooming in shows a smaller part, and the part always stays inside the photo', () => {
    const r = sourceRect({ zoom: 2, ox: -9999, oy: 9999 }, 400, 300, 300, 300)
    expect(r.sw).toBeCloseTo(150)
    expect(r.sx + r.sw).toBeCloseTo(400)
    expect(r.sy).toBeCloseTo(0)
    expect(r.sy + r.sh).toBeLessThanOrEqual(300.0001)
  })
})

describe('the saved size', () => {
  it('keeps the photo as it is when it is small and shrinks a large one', () => {
    expect(outputSize(800, 600)).toEqual({ width: 800, height: 600 })
    expect(outputSize(3200, 2400)).toEqual({ width: 1600, height: 1200 })
    expect(outputSize(0.2, 0.2)).toEqual({ width: 1, height: 1 })
  })
})
