// The arithmetic of the photo editor (crop frame, zoom, move). Pure, so it is unit-tested without a browser.
// The photo sits under a fixed frame: it is scaled to just cover the frame (zoom 1), zoomed up to MAX_ZOOM, and moved by dragging; it can never be moved
// so far that the frame shows empty space.

export const MAX_ZOOM = 4

export type CropAspect = 'square' | 'wide' | 'banner' | 'whole'

/** Frame width over height for each choice; "whole" follows the photo itself so nothing is cut off. */
export function aspectRatio(aspect: CropAspect, imageWidth: number, imageHeight: number): number {
  switch (aspect) {
    case 'square': return 1
    case 'wide': return 4 / 3
    case 'banner': return 16 / 9
    default: return imageWidth / imageHeight
  }
}

/** The frame's size on screen: as wide as the space allows, never taller than `maxHeight` (a tall frame is narrowed instead). */
export function frameSize(ratio: number, maxWidth: number, maxHeight: number): { width: number; height: number } {
  let width = maxWidth
  let height = width / ratio
  if (height > maxHeight) {
    height = maxHeight
    width = height * ratio
  }
  return { width: Math.round(width), height: Math.round(height) }
}

export type CropState = { zoom: number; /** The photo's centre, in screen pixels from the frame's centre. */ ox: number; oy: number }

/** The most the photo may be moved either way at this zoom, in screen pixels. */
export function moveLimits(imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number, zoom: number): { x: number; y: number; scale: number } {
  const scale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight) * zoom
  return { scale, x: Math.max(0, (imageWidth * scale - frameWidth) / 2), y: Math.max(0, (imageHeight * scale - frameHeight) / 2) }
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/** Keeps the zoom in range and the photo covering the frame. */
export function clampCrop(state: CropState, imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number): CropState {
  const zoom = clamp(state.zoom, 1, MAX_ZOOM)
  const lim = moveLimits(imageWidth, imageHeight, frameWidth, frameHeight, zoom)
  return { zoom, ox: clamp(state.ox, -lim.x, lim.x), oy: clamp(state.oy, -lim.y, lim.y) }
}

/** The part of the photo (in its own pixels) that the frame shows. */
export function sourceRect(state: CropState, imageWidth: number, imageHeight: number, frameWidth: number, frameHeight: number): { sx: number; sy: number; sw: number; sh: number } {
  const c = clampCrop(state, imageWidth, imageHeight, frameWidth, frameHeight)
  const { scale } = moveLimits(imageWidth, imageHeight, frameWidth, frameHeight, c.zoom)
  const sw = frameWidth / scale
  const sh = frameHeight / scale
  return { sx: imageWidth / 2 - c.ox / scale - sw / 2, sy: imageHeight / 2 - c.oy / scale - sh / 2, sw, sh }
}

/** The size of the saved picture: the shown part at its own resolution, never larger than `maxSide` on its long side. */
export function outputSize(sw: number, sh: number, maxSide = 1600): { width: number; height: number } {
  const k = Math.min(1, maxSide / Math.max(sw, sh))
  return { width: Math.max(1, Math.round(sw * k)), height: Math.max(1, Math.round(sh * k)) }
}
