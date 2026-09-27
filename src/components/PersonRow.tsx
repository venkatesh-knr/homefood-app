import type { ReactNode } from 'react'
import { Avatar } from './ui'

export function PersonRow({
  name,
  detail,
  color,
  right,
  children,
}: {
  name: string
  detail: string
  color: string
  right?: ReactNode
  /** Extra content under the row, e.g. an open edit form or a remove-confirm bar. */
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-line bg-white p-3">
      <div className="flex items-center gap-3">
        <Avatar name={name} color={color} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-[15px] font-semibold">{name}</span>
          <span className="truncate text-[12.5px] text-muted">{detail}</span>
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}
