alter table public.word_translations
  add column if not exists occurrence_ids text[] not null default '{}',
  add column if not exists context_left text null,
  add column if not exists context_right text null;

create index if not exists idx_word_translations_occurrence_ids
  on public.word_translations
  using gin (occurrence_ids);

-- Optional: If you want to clear doc-specific rows after promoting to known at a later date,
-- you can keep this clean-up query handy:
-- delete from public.word_translations wt
-- using public.user_vocabulary uv
-- where wt.user_id = uv.user_id
--   and wt.normalized_word = uv.romanian_word
--   and uv.known = true;