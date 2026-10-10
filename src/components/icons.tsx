// Small inline icons used where a word would be too heavy (recipe, YouTube, Instagram, favourite). Each is decorative
// (aria-hidden): the button or link around it carries the accessible name.

type IconProps = { size?: number; className?: string }

export function RecipeIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 6.5C10.3 5.2 8 4.7 4.5 4.7v12.6c3.5 0 5.8.5 7.5 1.8 1.7-1.3 4-1.8 7.5-1.8V4.7C16 4.7 13.7 5.2 12 6.5z" />
      <path d="M12 6.5v12.6" />
    </svg>
  )
}

export function YouTubeIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#E02424" />
      <path d="M10 8.9v6.2l5.3-3.1z" fill="#fff" />
    </svg>
  )
}

export function InstagramIcon({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#C13584" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1" fill="#C13584" stroke="none" />
    </svg>
  )
}

export function HeartIcon({ size = 22, filled = false, className }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.4 5 6.6 5c1.9 0 3.5 1 5.4 3 1.9-2 3.5-3 5.4-3 3.2 0 4.9 3 3.8 6.2-1.7 4.7-9.2 9.3-9.2 9.3z" />
    </svg>
  )
}
