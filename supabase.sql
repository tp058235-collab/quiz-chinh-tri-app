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
  ('Th? d� c?a Vi?t Nam l� g�?', 'H� N?i', '�� N?ng', 'TP.HCM', 'C?n Tho', 'A', 'L?ch s?', 'D?'),
  ('HTML d�ng d? l�m g�?', 'X�c d?nh h�nh vi', '�?nh nghia c?u tr�c n?i dung', 'Qu?n l� d? li?u', 'Thi?t k? d? h?a', 'B', 'Web', 'D?'),
  ('CSS d�ng d? t?o g�?', 'Logic x? l�', 'Giao di?n v� b? c?c', 'Co s? d? li?u', 'M�y ch?', 'B', 'Web', 'Trung b�nh');

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
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy if not exists "Users can read their attempts"
  on public.quiz_attempts for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their attempts"
  on public.quiz_attempts for insert
  with check (auth.uid() = user_id);

-- RPC l?y c�u h?i ng?u nhi�n
create or replace function public.get_random_questions(p_limit integer)
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
  order by random()
  limit greatest(1, least(coalesce(p_limit, 30), (select count(*) from public.questions)));
$$;
