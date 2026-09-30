// A safe, translated message for any caught error. Raw Supabase/PostgREST error text
// (unique-constraint violations, RLS policy names, column names…) is English-only,
// technical, and occasionally reveals schema details — not something to show a family
// member trying to plan dinner, in either language. The real error still goes to the
// console, so debugging from the browser's devtools still works.
export function describeError(err: unknown, t: (key: string) => string): string {
  console.error(err)
  return t('common.error')
}
