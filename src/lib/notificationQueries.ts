import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import { queryClient } from './queryClient'
import type { NotificationRow } from './notifications'

const POLL_MS = 60_000

/** My latest notifications. Any failure (e.g. the table isn't there yet) just means an empty list. */
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    enabled: Boolean(supabase),
    retry: false,
    refetchInterval: POLL_MS,
    queryFn: async (): Promise<NotificationRow[]> => {
      const { data, error } = await supabase!.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)
      if (error) return []
      return data as NotificationRow[]
    },
  })
}

/** The number on the bell. Checked every minute (and whenever the app is opened). */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread'],
    enabled: Boolean(supabase),
    retry: false,
    refetchInterval: POLL_MS,
    queryFn: async (): Promise<number> => {
      const { count, error } = await supabase!.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null)
      return error ? 0 : (count ?? 0)
    },
  })
}

async function refresh() {
  await queryClient.invalidateQueries({ queryKey: ['notifications'] })
  await queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
}

export async function markRead(id: string): Promise<void> {
  const { error } = await supabase!.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
  await refresh()
}

export async function markAllRead(): Promise<void> {
  const { error } = await supabase!.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null)
  if (error) throw error
  await refresh()
}

export async function clearAll(): Promise<void> {
  const { error } = await supabase!.from('notifications').delete().not('id', 'is', null)
  if (error) throw error
  await refresh()
}
