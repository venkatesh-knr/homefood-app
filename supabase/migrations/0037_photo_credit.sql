-- HomeFood · 0037: a credit for photos a home chose from the web
-- Run once in Supabase: Dashboard › SQL Editor › New query › paste › Run. Safe to run twice.
-- "Find a free photo online" (Add dish, Dish detail) lets a home pick a free-licence picture from Wikimedia Commons. CC BY and CC BY-SA photos need
-- a visible credit, so the credit text ("Author, CC BY-SA 4.0, via Wikimedia Commons") is saved with the home's photo and shown on the dish.
-- A photo a home took itself has no credit (null). Nothing else changes: who can read and write these rows is as before (the home's members).

alter table public.dish_photo_overrides add column if not exists photo_credit text check (char_length(photo_credit) <= 300);
