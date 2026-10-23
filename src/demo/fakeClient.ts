// A tiny in-memory stand-in for the Supabase client, used only by the demo home.
// It understands the slice of the query API the app uses (select with joined tables, filters, order, limit, insert,
// update, upsert, delete, single/maybeSingle, counts, rpc and storage) so every screen and query hook runs unchanged
// against made-up data. Nothing here touches the network or any storage: the data lives in one object that is thrown
// away when the demo closes.
import type { SupabaseClient } from '@supabase/supabase-js'
import { DEMO_USER_IDS, getDemoState } from './demoState'

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Row = Record<string, any>
export type Db = Record<string, Row[]>

type Rel = { kind: 'one' | 'many'; fk: string }

/** How a joined table hangs off its parent: `one` = the parent row holds the key, `many` = the child rows hold it. */
const REL: Record<string, Rel> = {
  'meal_slots.dishes': { kind: 'one', fk: 'main_dish_id' },
  'meal_slots.meal_slot_sides': { kind: 'many', fk: 'slot_id' },
  'meal_slots.meal_slot_cooks': { kind: 'many', fk: 'slot_id' },
  'meal_slots.meal_slot_eaters': { kind: 'many', fk: 'slot_id' },
  'meal_slot_sides.dishes': { kind: 'one', fk: 'dish_id' },
  'meal_slot_suggestions.dishes': { kind: 'one', fk: 'dish_id' },
  'meal_attendance.meal_slots': { kind: 'one', fk: 'slot_id' },
  'dishes.dish_names': { kind: 'many', fk: 'dish_id' },
  'recipes.recipe_ingredients': { kind: 'many', fk: 'recipe_id' },
  'recipes.recipe_steps': { kind: 'many', fk: 'recipe_id' },
}

const PK: Record<string, string[]> = {
  profile_allergies: ['profile_id', 'allergen'],
  dish_names: ['dish_id', 'language'],
  dish_photo_overrides: ['dish_id', 'household_id'],
  meal_slot_sides: ['slot_id', 'position'],
  meal_slot_cooks: ['slot_id', 'profile_id'],
  meal_slot_eaters: ['slot_id', 'profile_id'],
  meal_slot_votes: ['slot_id', 'profile_id'],
  recipe_ingredients: ['recipe_id', 'position'],
  recipe_steps: ['recipe_id', 'position'],
  dish_nutrition: ['dish_id'],
  nutrition_targets: ['age_band', 'sex', 'activity'],
  meal_attendance: ['slot_id', 'profile_id'],
  dish_favourites: ['household_id', 'dish_id'],
  personal_goals: ['profile_id'],
}

/** Other uniqueness rules the real database enforces. */
const UNIQUE: Record<string, string[][]> = {
  week_plans: [['household_id', 'week_start']],
  meal_slots: [['household_id', 'date', 'meal']],
  profiles: [['user_id']],
  shopping_items: [['household_id', 'name']],
}

/** What the database does to other tables when a row goes. */
const CASCADE: Record<string, [string, string][]> = {
  meal_slots: [['meal_slot_sides', 'slot_id'], ['meal_slot_cooks', 'slot_id'], ['meal_slot_eaters', 'slot_id'], ['meal_slot_votes', 'slot_id'], ['meal_slot_comments', 'slot_id'], ['meal_slot_suggestions', 'slot_id'], ['meal_attendance', 'slot_id'], ['notifications', 'slot_id']],
  week_plans: [['meal_slots', 'week_plan_id']],
  dishes: [['dish_names', 'dish_id'], ['meal_slot_sides', 'dish_id'], ['dish_photo_overrides', 'dish_id'], ['recipes', 'dish_id'], ['dish_nutrition', 'dish_id'], ['dish_favourites', 'dish_id'], ['meal_slot_suggestions', 'dish_id']],
  profiles: [['profile_allergies', 'profile_id'], ['meal_slot_cooks', 'profile_id'], ['meal_slot_eaters', 'profile_id'], ['meal_slot_votes', 'profile_id'], ['meal_slot_comments', 'profile_id'], ['meal_slot_suggestions', 'profile_id'], ['meal_attendance', 'profile_id'], ['planner_turns', 'profile_id'], ['notifications', 'profile_id']],
  recipes: [['recipe_ingredients', 'recipe_id'], ['recipe_steps', 'recipe_id']],
}
const SET_NULL: Record<string, [string, string][]> = {
  dishes: [['meal_slots', 'main_dish_id']],
  cuisines: [['dishes', 'cuisine_id']],
}

const nowIso = () => new Date().toISOString()

/** Rules the real database refuses a delete for (migration 0027), so the demo says no in the same way. */
const DELETE_GUARDS: Record<string, (db: Db, rows: Row[]) => string | null> = {
  cuisines: (db, rows) => (rows.some((c) => (db.dishes ?? []).some((d) => same(d.cuisine_id, c.id))) ? 'This cuisine still has dishes. Change or remove them first.' : null),
}

const DEFAULTS: Record<string, () => Row> = {
  week_plans: () => ({ status: 'draft', published_at: null }),
  meal_slots: () => ({ source: 'home', place_name: null, main_dish_id: null, note: null, status: 'proposed', kept_despite_disagree: false, updated_at: nowIso() }),
  planner_turns: () => ({ status: 'approved', requested_by: null, created_at: nowIso() }),
  meal_slot_comments: () => ({ created_at: nowIso() }),
  meal_slot_suggestions: () => ({ status: 'open', dish_id: null, free_text: null, created_at: nowIso(), resolved_at: null }),
  meal_slot_votes: () => ({ updated_at: nowIso() }),
  meal_attendance: () => ({ status: 'ate', portion: 'normal', updated_at: nowIso() }),
  profiles: () => ({ kind: 'family', role: 'member', can_login: false, user_id: null, birth_year: null, sex: null, activity: null, language: 'en', photo_path: null, created_at: nowIso() }),
  invites: () => ({ created_at: nowIso(), expires_at: new Date(Date.now() + 7 * 864e5).toISOString(), revoked_at: null, token: Math.random().toString(36).slice(2) }),
  dishes: () => ({ household_id: null, cuisine_id: null, meal_types: [], course: 'main', diet: 'veg', tags: [], allergens: [], prep_minutes: null, photo_path: null, photo_credit: null, recipe_search: null, where_seen: null, created_by: null, created_at: nowIso() }),
  cuisines: () => ({ parent_id: null, name_ta: null, sort_order: 100 }),
  dish_favourites: () => ({ created_at: nowIso() }),
  personal_intake: () => ({ eaten_at: null, common_food_id: null, custom_food_id: null, dish_id: null, kcal: null, protein_g: null, carbs_g: null, fat_g: null, fibre_g: null, sugar_g: null, sodium_mg: null, created_at: nowIso() }),
  personal_usuals: () => ({ common_food_id: null, custom_food_id: null, dish_id: null, created_at: nowIso() }),
  custom_foods: () => ({ name_ta: null, unit: 'piece', kcal: null, protein_g: null, carbs_g: null, fat_g: null, created_at: nowIso() }),
  dish_photo_overrides: () => ({ updated_at: nowIso() }),
  shopping_items: () => ({ name_ta: null, section: 'other', amount: null, unit: null, note: null, source: 'manual', source_dishes: [], is_regular: false, bought_at: null, bought_by: null, created_at: nowIso() }),
}

const HAS_ID = new Set(['personal_intake', 'personal_usuals', 'custom_foods', 'common_foods', 'households', 'profiles', 'invites', 'cuisines', 'dishes', 'week_plans', 'meal_slots', 'planner_turns', 'meal_slot_comments', 'meal_slot_suggestions', 'recipes', 'notifications', 'shopping_items'])

/** Tables whose rows are private to one person (migration 0029): their own login, or the Admin for family members with no login. */
const PERSONAL_TABLES = new Set(['personal_intake', 'personal_usuals', 'personal_goals'])

function viewerProfile(db: Db): Row | undefined {
  return (db.profiles ?? []).find((p) => p.user_id === DEMO_USER_IDS[getDemoState().role])
}

function canManagePersonal(db: Db, profileId: string): boolean {
  const viewer = viewerProfile(db)
  const p = (db.profiles ?? []).find((x) => x.id === profileId)
  if (!viewer || !p || p.kind !== 'family') return false
  return p.user_id === viewer.user_id || (p.can_login === false && viewer.role === 'admin' && p.household_id === viewer.household_id)
}

const NOT_IN_DEMO = 'This is not available in the demo.'

// ── select strings: "*, alias:table!inner(col, col2, nested(...))" ──
type Node = { alias: string; table: string; inner: boolean; cols: string[]; embeds: Node[] }

function splitTop(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  if (cur.trim()) out.push(cur)
  return out.map((x) => x.trim()).filter(Boolean)
}

export function parseSelect(s: string | undefined): Node {
  const root: Node = { alias: '', table: '', inner: false, cols: [], embeds: [] }
  for (const part of splitTop(s ?? '*')) {
    const open = part.indexOf('(')
    if (open === -1) {
      root.cols.push(part)
      continue
    }
    let head = part.slice(0, open).trim()
    const inside = part.slice(open + 1, part.lastIndexOf(')'))
    let alias = ''
    const colon = head.indexOf(':')
    if (colon !== -1) {
      alias = head.slice(0, colon)
      head = head.slice(colon + 1)
    }
    const [table = '', hint = ''] = head.split('!')
    const child = parseSelect(inside)
    root.embeds.push({ alias: alias || table, table, inner: hint === 'inner', cols: child.cols, embeds: child.embeds })
  }
  return root
}

const same = (a: unknown, b: unknown) => (a == null || b == null ? a == null && b == null : String(a) === String(b))
const cmp = (a: any, b: any) => (a == null ? (b == null ? 0 : 1) : b == null ? -1 : typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'en'))
const pick = (obj: Row, path: string): any => path.split('.').reduce((o: any, k) => (o == null ? o : o[k]), obj)

type Pred = (row: Row) => boolean

function condition(col: string, op: string, val: any): Pred {
  switch (op) {
    case 'eq': return (r) => same(pick(r, col), val)
    case 'neq': return (r) => !same(pick(r, col), val)
    case 'gt': return (r) => pick(r, col) != null && cmp(pick(r, col), val) > 0
    case 'gte': return (r) => pick(r, col) != null && cmp(pick(r, col), val) >= 0
    case 'lt': return (r) => pick(r, col) != null && cmp(pick(r, col), val) < 0
    case 'lte': return (r) => pick(r, col) != null && cmp(pick(r, col), val) <= 0
    case 'in': return (r) => (val as any[]).some((v) => same(pick(r, col), v))
    case 'is': return (r) => (val === null || val === 'null' ? pick(r, col) == null : same(pick(r, col), val))
    default: throw new Error(`demo client: unsupported filter ${op}`)
  }
}

function parseOr(expr: string): Pred {
  const preds = splitTop(expr).map((c) => {
    const [col = '', op = '', ...rest] = c.split('.')
    const raw = rest.join('.')
    return condition(col, op, raw === 'null' ? null : raw)
  })
  return (r) => preds.some((p) => p(r))
}

type Result = { data: any; error: { message: string; code?: string } | null; count?: number | null }
const fail = (message: string, code?: string): Result => ({ data: null, error: { message, code }, count: null })

class Query implements PromiseLike<Result> {
  private op: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
  private preds: Pred[] = []
  private orders: { col: string; asc: boolean }[] = []
  private max: number | null = null
  private selectStr: string | undefined = '*'
  private returning = true
  private head = false
  private countMode = false
  private one: 'one' | 'maybe' | null = null
  private payload: Row | Row[] | null = null
  private conflictCols: string[] | null = null

  private db: Db
  private table: string

  constructor(db: Db, table: string) {
    this.db = db
    this.table = table
  }

  select(cols?: string, opts?: { count?: string; head?: boolean }) {
    this.selectStr = cols ?? '*'
    this.returning = true
    if (opts?.count) this.countMode = true
    if (opts?.head) this.head = true
    return this
  }
  insert(rows: Row | Row[]) { this.op = 'insert'; this.payload = rows; this.returning = false; return this }
  upsert(rows: Row | Row[], opts?: { onConflict?: string }) {
    this.op = 'upsert'
    this.payload = rows
    this.conflictCols = opts?.onConflict ? opts.onConflict.split(',').map((s) => s.trim()) : null
    this.returning = false
    return this
  }
  update(patch: Row) { this.op = 'update'; this.payload = patch; this.returning = false; return this }
  delete() { this.op = 'delete'; this.returning = false; return this }
  eq(col: string, val: any) { this.preds.push(condition(col, 'eq', val)); return this }
  neq(col: string, val: any) { this.preds.push(condition(col, 'neq', val)); return this }
  gt(col: string, val: any) { this.preds.push(condition(col, 'gt', val)); return this }
  gte(col: string, val: any) { this.preds.push(condition(col, 'gte', val)); return this }
  lt(col: string, val: any) { this.preds.push(condition(col, 'lt', val)); return this }
  lte(col: string, val: any) { this.preds.push(condition(col, 'lte', val)); return this }
  in(col: string, vals: any[]) { this.preds.push(condition(col, 'in', vals)); return this }
  is(col: string, val: any) { this.preds.push(condition(col, 'is', val)); return this }
  not(col: string, op: string, val: any) {
    const p = condition(col, op, val)
    this.preds.push((r) => !p(r))
    return this
  }
  or(expr: string) { this.preds.push(parseOr(expr)); return this }
  order(col: string, opts?: { ascending?: boolean }) { this.orders.push({ col, asc: opts?.ascending !== false }); return this }
  limit(n: number) { this.max = n; return this }
  single() { this.one = 'one'; return this }
  maybeSingle() { this.one = 'maybe'; return this }

  then<A = Result, B = never>(onOk?: ((v: Result) => A | PromiseLike<A>) | null, onErr?: ((e: unknown) => B | PromiseLike<B>) | null): PromiseLike<A | B> {
    return Promise.resolve()
      .then(() => this.run())
      .then(onOk, onErr)
  }

  // ── execution ──
  /** The privacy rule: other people's personal rows are invisible and untouchable. */
  private allowed(r: Row): boolean {
    return !PERSONAL_TABLES.has(this.table) || canManagePersonal(this.db, r.profile_id)
  }

  private rows(): Row[] {
    return (this.db[this.table] ??= [])
  }

  /** A row with its joined tables attached (every column kept, so filters can look at any of them). */
  private expand(table: string, row: Row, node: Node): Row | null {
    const out: Row = { ...row }
    for (const e of node.embeds) {
      const rel = REL[`${table}.${e.table}`]
      if (!rel) throw new Error(`demo client: unknown relation ${table}.${e.table}`)
      if (rel.kind === 'one') {
        const target = (this.db[e.table] ?? []).find((r) => same(r.id, row[rel.fk]))
        const built = target ? this.shape(e.table, target, e) : null
        if (!built && e.inner) return null
        out[e.alias] = built
      } else {
        out[e.alias] = (this.db[e.table] ?? []).filter((r) => same(r[rel.fk], row.id)).map((r) => this.shape(e.table, r, e))
      }
    }
    return out
  }

  /** The columns a select asked for (plus its joined tables). */
  private shape(table: string, row: Row, node: Node): Row {
    const full = this.expand(table, row, node)!
    return this.project(full, node)
  }

  private project(full: Row, node: Node): Row {
    if (node.cols.includes('*') || (node.cols.length === 0 && node.embeds.length === 0)) return { ...full }
    const out: Row = {}
    for (const c of node.cols) out[c] = full[c]
    for (const e of node.embeds) out[e.alias] = full[e.alias]
    return out
  }

  private conflict(row: Row, ignore?: Row): Row | null {
    const keys = [PK[this.table] ?? (HAS_ID.has(this.table) ? ['id'] : []), ...(UNIQUE[this.table] ?? [])].filter((k) => k.length > 0)
    for (const k of keys) {
      if (k.some((c) => row[c] == null)) continue
      const hit = this.rows().find((r) => r !== ignore && k.every((c) => same(r[c], row[c])))
      if (hit) return hit
    }
    return null
  }

  private cascade(table: string, gone: Row[]) {
    for (const [child, col] of CASCADE[table] ?? []) {
      const ids = gone.map((r) => r.id ?? r[col])
      const victims = (this.db[child] ?? []).filter((r) => ids.some((id) => same(r[col], id)))
      if (victims.length) {
        this.db[child] = (this.db[child] ?? []).filter((r) => !victims.includes(r))
        this.cascade(child, victims)
      }
    }
    for (const [child, col] of SET_NULL[table] ?? []) {
      for (const r of this.db[child] ?? []) if (gone.some((g) => same(g.id, r[col]))) r[col] = null
    }
  }

  private run(): Result {
    const node = parseSelect(this.selectStr)
    let affected: Row[] = []

    if (this.op === 'insert' || this.op === 'upsert') {
      const list = Array.isArray(this.payload) ? this.payload : [this.payload ?? {}]
      for (const input of list) {
        const row: Row = { ...(DEFAULTS[this.table]?.() ?? {}), ...input }
        if (HAS_ID.has(this.table) && row.id == null) row.id = crypto.randomUUID()
        if (PERSONAL_TABLES.has(this.table) && !canManagePersonal(this.db, row.profile_id)) return fail('new row violates row-level security policy', '42501')
        const hit = this.op === 'upsert' ? this.upsertTarget(row) : this.conflict(row)
        if (hit && this.op === 'insert') return fail(`duplicate key value violates unique constraint on ${this.table}`, '23505')
        if (hit) {
          Object.assign(hit, input)
          affected.push(hit)
        } else {
          this.rows().push(row)
          affected.push(row)
        }
      }
    } else if (this.op === 'update') {
      affected = this.rows().filter((r) => this.allowed(r) && this.matches(r, node))
      for (const r of affected) {
        const next = { ...r, ...(this.payload as Row) }
        const hit = this.conflict(next, r)
        if (hit) return fail(`duplicate key value violates unique constraint on ${this.table}`, '23505')
        Object.assign(r, this.payload)
      }
    } else if (this.op === 'delete') {
      affected = this.rows().filter((r) => this.allowed(r) && this.matches(r, node))
      const refusal = DELETE_GUARDS[this.table]?.(this.db, affected)
      if (refusal) return fail(refusal, 'P0001')
      this.db[this.table] = this.rows().filter((r) => !affected.includes(r))
      this.cascade(this.table, affected)
    } else {
      const working: { row: Row; full: Row }[] = []
      for (const r of this.rows()) {
        if (!this.allowed(r)) continue
        const full = this.expand(this.table, r, node)
        if (full && this.preds.every((p) => p(full))) working.push({ row: r, full })
      }
      for (const o of [...this.orders].reverse()) working.sort((a, b) => (o.asc ? 1 : -1) * cmp(pick(a.full, o.col), pick(b.full, o.col)))
      const count = working.length
      const slice = this.max == null ? working : working.slice(0, this.max)
      if (this.head) return { data: null, error: null, count: this.countMode ? count : null }
      return this.finish(slice.map((w) => this.project(w.full, node)), count)
    }

    if (!this.returning) return { data: null, error: null, count: null }
    return this.finish(affected.map((r) => this.shape(this.table, r, node)), affected.length)
  }

  private upsertTarget(row: Row): Row | null {
    if (this.conflictCols) return this.rows().find((r) => this.conflictCols!.every((c) => same(r[c], row[c]))) ?? null
    return this.conflict(row)
  }

  private matches(r: Row, node: Node): boolean {
    const full = node.embeds.length ? this.expand(this.table, r, node) : r
    return Boolean(full) && this.preds.every((p) => p(full!))
  }

  private finish(rows: Row[], count: number): Result {
    const counted = this.countMode ? count : null
    if (this.one) {
      if (rows.length === 1) return { data: rows[0], error: null, count: counted }
      if (rows.length === 0 && this.one === 'maybe') return { data: null, error: null, count: counted }
      return fail('JSON object requested, multiple (or no) rows returned', 'PGRST116')
    }
    return { data: rows, error: null, count: counted }
  }
}

/** The demo's version of the `save_household_recipe` function: one copy of a recipe per dish for the home, replaced as a whole. */
function saveHouseholdRecipe(db: Db, a: Row): Result {
  const ingredients = (a.p_ingredients ?? []) as Row[]
  const steps = (a.p_steps ?? []) as Row[]
  if (ingredients.length === 0) return fail('A recipe needs at least one ingredient')
  if (steps.length === 0) return fail('A recipe needs at least one step')
  const home = db.households?.[0]?.id
  const recipes = (db.recipes ??= [])
  let recipe = recipes.find((r) => r.dish_id === a.p_dish && r.household_id === home)
  if (!recipe) {
    recipe = { id: crypto.randomUUID(), dish_id: a.p_dish, household_id: home, credit: null, created_at: nowIso() }
    recipes.push(recipe)
  }
  Object.assign(recipe, { servings: a.p_servings, prep_minutes: a.p_prep, cook_minutes: a.p_cook, note: a.p_note, note_ta: a.p_note_ta })
  db.recipe_ingredients = (db.recipe_ingredients ?? []).filter((r) => r.recipe_id !== recipe.id)
  db.recipe_steps = (db.recipe_steps ?? []).filter((r) => r.recipe_id !== recipe.id)
  ingredients.forEach((i, k) => db.recipe_ingredients!.push({ recipe_id: recipe.id, position: k + 1, name: i.name, name_ta: i.name_ta ?? null, quantity: i.quantity ?? null, unit: i.unit }))
  steps.forEach((s, k) => db.recipe_steps!.push({ recipe_id: recipe.id, position: k + 1, body: s.body, body_ta: s.body_ta ?? null }))
  return { data: recipe.id, error: null, count: null }
}

/** The demo's version of `family_extras_totals`: each family member's daily SUMS of extras, never the items; for the Admin or whoever plans today. */
function familyExtrasTotals(db: Db, a: Row): Result {
  const viewer = viewerProfile(db)
  const today = new Date().toISOString().slice(0, 10)
  const planner = (db.planner_turns ?? []).some((t) => t.profile_id === viewer?.id && t.status === 'approved' && t.start_date <= today && today <= t.end_date)
  if (!viewer || (viewer.role !== 'admin' && !planner)) return fail("Only an Admin or today's Planner can see the family's totals", 'P0001')
  const sums = new Map<string, Row>()
  for (const i of db.personal_intake ?? []) {
    const p = (db.profiles ?? []).find((x) => x.id === i.profile_id)
    if (!p || p.kind !== 'family' || i.eaten_on < a.p_from || i.eaten_on > a.p_to) continue
    const key = `${i.profile_id}|${i.eaten_on}`
    const s = sums.get(key) ?? { profile_id: i.profile_id, eaten_on: i.eaten_on, kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fibre_g: 0, sugar_g: 0, sodium_mg: 0, items: 0, unknown_items: 0 }
    for (const k of ['kcal', 'protein_g', 'carbs_g', 'fat_g', 'fibre_g', 'sugar_g', 'sodium_mg']) s[k] += Number(i[k] ?? 0)
    s.items += 1
    if (i.kcal == null) s.unknown_items += 1
    sums.set(key, s)
  }
  return { data: [...sums.values()], error: null, count: null }
}

/** The demo's version of `clear_shopping_list`: Admin only; everything that is not a regular goes, regulars are put to sleep. */
function clearShoppingList(db: Db): Result {
  const viewer = viewerProfile(db)
  if (!viewer || viewer.role !== 'admin') return fail('Only an Admin can clear the shopping list', 'P0001')
  const mine = (r: Row) => r.household_id === viewer.household_id
  const removed = (db.shopping_items ?? []).filter((r) => mine(r) && !r.is_regular).length
  db.shopping_items = (db.shopping_items ?? []).filter((r) => !mine(r) || r.is_regular)
  for (const r of db.shopping_items) if (mine(r)) Object.assign(r, { bought_at: new Date(Date.now() - 2 * 864e5).toISOString(), bought_by: null })
  return { data: removed, error: null, count: null }
}

/** A Supabase-shaped client over one in-memory database. */
export function createDemoClient(db: Db): SupabaseClient {
  const client = {
    from: (table: string) => new Query(db, table),
    rpc: async (name: string, args: Row = {}): Promise<Result> =>
      name === 'save_household_recipe' ? saveHouseholdRecipe(db, args) : name === 'family_extras_totals' ? familyExtrasTotals(db, args) : name === 'clear_shopping_list' ? clearShoppingList(db) : fail(NOT_IN_DEMO),
    storage: {
      from: () => ({
        createSignedUrl: async (path: string) => ({ data: { signedUrl: path }, error: null }),
        upload: async () => ({ data: null, error: { message: NOT_IN_DEMO } }),
        remove: async () => ({ data: [], error: null }),
      }),
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signOut: async () => ({ error: null }),
    },
  }
  return client as unknown as SupabaseClient
}
