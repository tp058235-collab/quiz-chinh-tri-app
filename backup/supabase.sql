-- T?o b?ng c�u h?i theo schema hi?n t?i
create table if not exists public.questions (
  id serial primary key,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null check (correct_answer in ('A','B','C','D')),
  lesson text,
  level text,
  created_at timestamptz not null default now()
);

-- D? li?u m?u d? test nhanh
insert into public.questions (question_text, option_a, option_b, option_c, option_d, correct_answer, lesson, level)
values
-- B?ng luu l?ch s? l�m b�i
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null,
  total_questions integer not null,
  correct_count integer not null,
  wrong_count integer not null,
  score_percent numeric not null,
  duration_seconds integer not null,
  subject_id text,
  subject_slug text,
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy if not exists "Users can read their attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- RPC lấy câu hỏi ngẫu nhiên (có thể lọc theo bài/phần)
drop function if exists public.get_random_questions(integer);
create or replace function public.get_random_questions(
  p_limit integer,
  p_lesson text default null
)
returns table (
  id integer,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer text,
  lesson text,
  level text,
  created_at timestamptz
)
language sql
as $$
  select id, question_text, option_a, option_b, option_c, option_d, correct_answer, lesson, level, created_at
  from public.questions
  where (p_lesson is null or lesson = p_lesson)
  order by random()
  limit greatest(
    1,
    least(
      coalesce(p_limit, 30),
      (select count(*) from public.questions q2 where (p_lesson is null or q2.lesson = p_lesson))
    )
  );
$$;

-- RPC: Lấy câu hỏi ngẫu nhiên theo môn học và bài
create or replace function public.get_random_questions_by_lesson(
  p_limit integer,
  p_lesson text default null,
  p_subject_slug text default null
)
returns table (
  id integer,
  question_text text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  correct_answer text,
  lesson text,
  level text,
  created_at timestamptz
)
language sql
as $$
  select id, question_text, option_a, option_b, option_c, option_d, correct_answer, lesson, level, created_at
  from public.questions
  where (p_lesson is null or p_lesson = 'all' or lesson = p_lesson)
    and (p_subject_slug is null or subject_slug = p_subject_slug)
  order by random()
  limit coalesce(p_limit, 30);
$$;

-- RPC: danh sách bài/phần đang có trong bảng questions
create or replace function public.get_lessons(p_subject_slug text default null)
returns table (
  lesson text,
  question_count bigint
)
language sql
as $$
  select lesson, count(*)::bigint as question_count
  from public.questions
  where lesson is not null 
    and length(trim(lesson)) > 0
    and (p_subject_slug is null or subject_slug = p_subject_slug)
  group by lesson
  order by lesson;
$$;

-- Lấy danh sách môn học
create or replace function public.get_subjects()
returns table (id integer, name text, slug text)
language sql
as $$
  select id, name, slug from public.subjects order by id;
$$;

grant execute on function public.get_lessons() to anon, authenticated;
grant execute on function public.get_lessons(text) to anon, authenticated;
grant execute on function public.get_subjects() to anon, authenticated;
grant execute on function public.get_random_questions_by_lesson(integer, text, text) to anon, authenticated;

-- Bảng hồ sơ người dùng (lưu họ tên để hiển thị bảng xếp hạng)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy if not exists "Profiles are readable for authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy if not exists "Users can insert their profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- RPC: Lấy bảng xếp hạng (top điểm cao nhất).
-- Dùng SECURITY DEFINER để đọc được toàn bộ quiz_attempts dù table có RLS.
create or replace function public.get_leaderboard(
  p_limit integer default 10,
  p_subject_slug text default null
)
returns table (
  rank integer,
  user_id uuid,
  full_name text,
  best_score numeric,
  attempts bigint
)
language sql
security definer
set search_path = public
as $$
  with agg as (
    select
      qa.user_id,
      coalesce(p.full_name, 'Không tên') as full_name,
      max(qa.correct_count) as best_score,
      count(*)::bigint as attempts
    from public.quiz_attempts qa
    left join public.profiles p on p.user_id = qa.user_id
    where (p_subject_slug is null or qa.subject_slug = p_subject_slug)
    group by qa.user_id, p.full_name
  ),
  ranked as (
    select
      row_number() over (order by best_score desc, attempts asc, user_id asc)::int as rank,
      user_id,
      full_name,
      best_score,
      attempts
    from agg
  )
  select rank, user_id, full_name, best_score, attempts
  from ranked
  order by rank
  limit greatest(1, least(coalesce(p_limit, 10), 100));
$$;

grant execute on function public.get_leaderboard(integer) to anon, authenticated;
grant execute on function public.get_leaderboard(integer, text) to anon, authenticated;
grant execute on function public.get_random_questions(integer, text) to anon, authenticated;
