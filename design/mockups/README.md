# HomeFood mockups

Snapshot of the "HomeFood Mockups" design canvas (claude.ai), exported 28 Sep 2026.
**Use the PNGs as the visual reference** for layout, spacing, colours and copy. The `.dc.html` files hold the exact
markup, inline styles and sample data (the `{{…}}` placeholders and `<sc-for>`/`<sc-if>` tags are the canvas's
template syntax, not something to copy). They don't render on their own; open the PNGs instead.

Phone screens are 390 px wide. Sample people: Amma (Admin/Planner), Appa, Paati (no login), Kavi, Arun, Helper (cook only).

| Screen | Image | Source |
| --- | --- | --- |
| 1 · Week planner (Planner's view) | `png/Planner.png` | `html/Planner.dc.html` |
| 2 · Edit a meal: source, sides, cooks | `png/SlotEditor.png` | `html/SlotEditor.dc.html` |
| 3 · Dish picker with filters | `png/DishPicker.png` | `html/DishPicker.dc.html` |
| 4 · Today (family member's home screen) | `png/Today.png` | `html/Today.dc.html` |
| 5 · Meal discussion: votes, suggestion, comments | `png/Discussion.png` | `html/Discussion.dc.html` |
| 6 · Sign in with email code | `png/SignIn.png` | `html/SignIn.dc.html` |
| 7 · Set up your home (Admin) | `png/SetupHome.png` | `html/SetupHome.dc.html` |
| 8 · Invite family + getting started | `png/Invite.png` | `html/Invite.dc.html` |
| 9 · Join from invite link | `png/Join.png` | `html/Join.dc.html` |
| 10 · Dish detail: photo, nutrition, family notes | `png/DishDetail.png` | `html/DishDetail.dc.html` |
| 11 · Recipe: servings, cook mode, steps | `png/Recipe.png` | `html/Recipe.dc.html` |
| 12 · Snap a dish seen outside | `png/SnapDish.png` | `html/SnapDish.dc.html` |
| 13 · Planner rota: take a turn | `png/Rota.png` | `html/Rota.dc.html` |
| Saved image for WhatsApp · dishes only | `png/Share.png` | `html/Share.dc.html` |
| Week at a glance · phone | `png/Phone.png` | `html/Phone.dc.html` |
| Week at a glance · tablet and laptop | `png/Main.png` | `html/Main.dc.html` |

## Screens by build step

- Step 1 (done): 6 · Sign in
- **Step 2 · Home setup: 7 · Set up your home → 8 · Invite family + getting started → 9 · Join from invite link.**
  Setup is a 2-step first-run flow (Step 1 of 2 = home + people, Step 2 of 2 = invite). After setup, the same
  People and Invite sections are reachable from the Home tab for the Admin.
- Step 3: 3 · Dish picker, 10 · Dish detail, 11 · Recipe, 12 · Snap a dish
- Step 4: 1 · Week planner, 2 · Edit a meal, 5 · Meal discussion, 13 · Planner rota
- Step 5: 4 · Today, Week at a glance (phone, tablet/laptop, saved image for WhatsApp)

If the live canvas changes, ask Claude in the HomeFood project to re-export this folder.
