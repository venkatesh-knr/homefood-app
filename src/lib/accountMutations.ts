import { supabase } from './supabase'
import { queryClient } from './queryClient'
import { exportFileName } from './account'

function client() {
  if (!supabase) throw new Error('Supabase is not configured')
  return supabase
}

/** Downloads everything about me as a JSON file (the data comes from export_my_data, which only ever contains what I can see). */
export async function downloadMyData(email: string | undefined): Promise<void> {
  const { data, error } = await client().rpc('export_my_data')
  if (error) throw error
  const doc = { account: { email: email ?? null }, ...(data as Record<string, unknown>) }
  const url = URL.createObjectURL(new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = exportFileName()
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Ends every session of this login, on every phone and computer. */
export async function signOutEverywhere(): Promise<void> {
  const { error } = await client().auth.signOut({ scope: 'global' })
  if (error) throw error
  queryClient.clear()
}

async function leave() {
  try {
    await client().auth.signOut({ scope: 'local' }) // the login is already gone on the server; this clears the phone
  } catch {
    /* nothing left to end */
  }
  queryClient.clear()
}

/** Removes my login and my personal rows; my name on past plans becomes "Former member". Refused for the last Admin. */
export async function deleteMyAccount(): Promise<void> {
  const { error } = await client().rpc('delete_my_account')
  if (error) throw error
  await leave()
}

/** Admin: deletes the whole home. The uploaded photos are removed first (the database cannot empty the storage bucket), then the home and its logins. */
export async function deleteHousehold(householdId: string, typedName: string): Promise<void> {
  const bucket = client().storage.from('dish-photos')
  for (let page = 0; page < 20; page++) {
    const { data: files, error: listError } = await bucket.list(householdId, { limit: 1000 })
    if (listError) throw listError
    if (!files || files.length === 0) break
    const { error: removeError } = await bucket.remove(files.map((f) => `${householdId}/${f.name}`))
    if (removeError) throw removeError
  }
  const { error } = await client().rpc('delete_household', { p_confirm_name: typedName })
  if (error) throw error
  await leave()
}
