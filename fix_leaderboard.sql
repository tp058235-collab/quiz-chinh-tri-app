-- Chạy toàn bộ file này một lần trong Supabase SQL Editor.
-- Bảng xếp hạng lấy correct_count làm nguồn điểm chính xác.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'quiz_attempts'
      and column_name = 'score_points'
  ) then
    execute '
      update public.quiz_attempts
      set score_points = coalesce(correct_count, 0)
      where score_points is distinct from coalesce(correct_count, 0)
    ';
  end if;
end
$$;

drop function if exists public.get_leaderboard(integer, text);
drop function if exists public.get_leaderboard(text, integer);
drop function if exists public.get_leaderboard(integer);
drop function if exists public.get_leaderboard();

create function public.get_leaderboard(
  p_limit integer default 50,
  p_subject_slug text default null
)
returns table (
  rank bigint,
  user_id uuid,
  full_name text,
  best_score bigint,
  attempts bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with user_scores as (
    select
      qa.user_id,
      coalesce(
        nullif(trim(p.full_name), ''),
        nullif(split_part(u.email, '@', 1), ''),
        'Không tên'
      )::text as full_name,
      max(coalesce(qa.correct_count, 0))::bigint as best_score,
      count(*)::bigint as attempts,
      max(qa.created_at) as latest_attempt
    from public.quiz_attempts qa
    left join public.profiles p
      on p.user_id = qa.user_id
    left join auth.users u
      on u.id = qa.user_id
    where
      p_subject_slug is null
      or trim(p_subject_slug) = ''
      or qa.subject_slug = p_subject_slug
    group by
      qa.user_id,
      p.full_name,
      u.email
  ),
  ranked as (
    select
      dense_rank() over (
        order by best_score desc
      )::bigint as rank,
      user_id,
      full_name,
      best_score,
      attempts,
      latest_attempt
    from user_scores
  )
  select
    ranked.rank,
    ranked.user_id,
    ranked.full_name,
    ranked.best_score,
    ranked.attempts
  from ranked
  order by
    ranked.rank asc,
    ranked.latest_attempt asc,
    ranked.full_name asc
  limit least(greatest(coalesce(p_limit, 50), 1), 50);
$$;

grant execute on function public.get_leaderboard(integer, text)
to anon, authenticated;

notify pgrst, 'reload schema';

-- Kiểm tra toàn bộ bảng xếp hạng:
select * from public.get_leaderboard(50, null);
