-- =============================================================================
-- Quiz App - Schema Supabase (file DUY NHẤT, thay cho:
--   backup/supabase.sql + fix_leaderboard.sql + fix_leaderboard_total_score.sql)
--
-- Cách dùng: dán toàn bộ file này vào Supabase SQL Editor rồi Run.
-- An toàn: script chạy được nhiều lần, KHÔNG xoá bảng và KHÔNG xoá dữ liệu.
--   - create table if not exists  -> bảng đã có thì bỏ qua
--   - add column if not exists    -> cột đã có thì bỏ qua
--   - drop policy / drop function -> chỉ thay định nghĩa, không đụng dữ liệu
-- =============================================================================


-- =============================================================================
-- 1. BẢNG
-- =============================================================================

-- 1.1 Môn học ----------------------------------------------------------------
create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now()
);

-- 1.2 Ngân hàng câu hỏi ------------------------------------------------------
create table if not exists public.questions (
  id              uuid primary key default gen_random_uuid(),
  question_text   text not null,
  option_a        text not null,
  option_b        text not null,
  option_c        text not null,
  option_d        text not null,
  correct_answer  text not null check (correct_answer in ('A','B','C','D')),
  lesson          text,
  level           text,
  created_at      timestamptz not null default now()
);

-- Các cột được thêm ở những lần nâng cấp sau (app.js có dùng):
alter table public.questions add column if not exists explanation  text;
alter table public.questions add column if not exists subject_slug text;

-- 1.3 Hồ sơ người dùng (tên hiển thị cho bảng xếp hạng) ----------------------
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name  text;
alter table public.profiles add column if not exists email      text;
alter table public.profiles add column if not exists updated_at timestamptz default now();

-- app.js upsert với onConflict: 'user_id' -> bắt buộc user_id phải UNIQUE
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass and contype = 'u'
      and conkey = array[(select attnum from pg_attribute
                          where attrelid = 'public.profiles'::regclass
                            and attname = 'user_id')]
  ) then
    alter table public.profiles add constraint profiles_user_id_key unique (user_id);
  end if;
end $$;

-- 1.4 Lịch sử làm bài --------------------------------------------------------
create table if not exists public.quiz_attempts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  mode              text not null,
  total_questions   integer not null,
  correct_count     integer not null,
  wrong_count       integer not null,
  score_percent     numeric not null,
  duration_seconds  integer not null,
  created_at        timestamptz not null default now()
);

alter table public.quiz_attempts add column if not exists score_points integer;
alter table public.quiz_attempts add column if not exists subject_slug text;
alter table public.quiz_attempts add column if not exists subject_id   text;

-- 1.5 Index cho truy vấn hay dùng -------------------------------------------
create index if not exists quiz_attempts_user_id_idx      on public.quiz_attempts (user_id);
create index if not exists quiz_attempts_subject_slug_idx on public.quiz_attempts (subject_slug);
create index if not exists quiz_attempts_created_at_idx   on public.quiz_attempts (created_at desc);
create index if not exists questions_subject_lesson_idx   on public.questions (subject_slug, lesson);


-- =============================================================================
-- 2. ROW LEVEL SECURITY
--    Lưu ý: app.js gọi .from('quiz_attempts').select('*') KHÔNG kèm bộ lọc
--    user_id -> việc "chỉ thấy lịch sử của mình" hoàn toàn dựa vào policy dưới.
-- =============================================================================

alter table public.subjects      enable row level security;
alter table public.questions     enable row level security;
alter table public.profiles      enable row level security;
alter table public.quiz_attempts enable row level security;

-- 2.1 subjects: ai cũng đọc được (màn hình chọn môn hiện trước khi đăng nhập)
drop policy if exists "subjects_select_all" on public.subjects;
create policy "subjects_select_all"
  on public.subjects for select
  to anon, authenticated
  using (true);

-- 2.2 questions: chỉ người đã đăng nhập mới đọc được
--     (chặn khách vãng lai tải nguyên ngân hàng câu hỏi kèm đáp án)
drop policy if exists "Authenticated users can read questions" on public.questions;
drop policy if exists "questions_select_authenticated" on public.questions;
create policy "questions_select_authenticated"
  on public.questions for select
  to authenticated
  using (true);

-- 2.3 profiles: mỗi người chỉ đọc/ghi hồ sơ của chính mình
--     (bảng xếp hạng lấy tên qua RPC security definer nên không cần mở rộng)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2.4 quiz_attempts: mỗi người chỉ đọc/ghi lịch sử của chính mình
--
-- Dọn các policy kiểu cũ bị trùng và policy UPDATE.
-- App chỉ INSERT vào quiz_attempts, KHÔNG bao giờ UPDATE. Nếu vẫn mở quyền
-- UPDATE thì người dùng có thể tự sửa correct_count của mình để leo hạng.
drop policy if exists "Users can read their attempts"       on public.quiz_attempts;
drop policy if exists "Users can insert their attempts"     on public.quiz_attempts;
drop policy if exists "Users can read their own attempts"   on public.quiz_attempts;
drop policy if exists "Users can insert their own attempts" on public.quiz_attempts;
drop policy if exists "Users can update their own attempts" on public.quiz_attempts;
drop policy if exists "quiz_attempts_update_own"            on public.quiz_attempts;

drop policy if exists "quiz_attempts_select_own" on public.quiz_attempts;
create policy "quiz_attempts_select_own"
  on public.quiz_attempts for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "quiz_attempts_insert_own" on public.quiz_attempts;
create policy "quiz_attempts_insert_own"
  on public.quiz_attempts for insert
  to authenticated
  with check (auth.uid() = user_id);


-- =============================================================================
-- 3. RPC
--    Dùng drop + create (thay vì create or replace) để đổi được kiểu trả về.
-- =============================================================================

-- 3.1 Danh sách môn học ------------------------------------------------------
-- Trả id dạng text để chạy đúng dù cột subjects.id là uuid hay integer.
-- app.js chỉ gửi subject_id khi giá trị này là UUID hợp lệ (hàm isValidUuid).
drop function if exists public.get_subjects();
create function public.get_subjects()
returns table (id text, name text, slug text)
language sql
stable
set search_path = public
as $$
  select s.id::text, s.name, s.slug
  from public.subjects s
  order by s.name;
$$;

-- 3.2 Danh sách bài / phần của một môn ---------------------------------------
drop function if exists public.get_lessons();
drop function if exists public.get_lessons(text);
create function public.get_lessons(p_subject_slug text default null)
returns table (lesson text, question_count bigint)
language sql
stable
set search_path = public
as $$
  select q.lesson, count(*)::bigint as question_count
  from public.questions q
  where q.lesson is not null
    and length(trim(q.lesson)) > 0
    and (p_subject_slug is null or trim(p_subject_slug) = '' or q.subject_slug = p_subject_slug)
  group by q.lesson
  order by q.lesson;
$$;

-- 3.3 Lấy câu hỏi ngẫu nhiên theo môn + bài ----------------------------------
-- QUAN TRỌNG: có trả về cột explanation, nếu thiếu thì phần "Giải thích"
-- trong app.js sẽ không bao giờ hiện ra.
-- Xoá các overload cũ trùng tên tham số: nếu tồn tại nhiều hàm cùng bộ tên
-- {p_limit, p_lesson, p_subject_slug} thì PostgREST báo lỗi PGRST203 vì không
-- chọn được hàm nào.
drop function if exists public.get_random_questions_by_lesson(text, integer, text);
drop function if exists public.get_random_questions_by_lesson(integer, text);
drop function if exists public.get_random_questions(integer);
drop function if exists public.get_random_questions(integer, text);

drop function if exists public.get_random_questions_by_lesson(integer, text, text);
create function public.get_random_questions_by_lesson(
  p_limit        integer,
  p_lesson       text default null,
  p_subject_slug text default null
)
returns table (
  id              uuid,
  question_text   text,
  option_a        text,
  option_b        text,
  option_c        text,
  option_d        text,
  correct_answer  text,
  explanation     text,
  lesson          text,
  level           text,
  created_at      timestamptz
)
language sql
stable
set search_path = public
as $$
  select q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d,
         q.correct_answer, q.explanation, q.lesson, q.level, q.created_at
  from public.questions q
  where (p_lesson is null or p_lesson = 'all' or q.lesson = p_lesson)
    and (p_subject_slug is null or trim(p_subject_slug) = '' or q.subject_slug = p_subject_slug)
  order by random()
  limit greatest(1, coalesce(p_limit, 30));
$$;

-- 3.4 Bảng xếp hạng ----------------------------------------------------------
-- security definer để đọc được quiz_attempts của mọi người dù bảng có RLS.
--
-- CÁCH TÍNH ĐIỂM: cộng dồn (SUM) số câu đúng của tất cả các lượt THI THỬ,
-- tính riêng cho từng môn. Bài luyện tập và bài "làm lại câu sai" KHÔNG được
-- tính điểm, tránh việc cày điểm bằng cách luyện tập lặp lại.
-- App luôn gọi kèm p_subject_slug nên điểm hiển thị là điểm của riêng môn đó.
--
-- Muốn tính cả bài luyện tập: xoá dòng "and qa.mode in ('exam_30','exam_70')".
-- Muốn lấy điểm cao nhất của 1 lượt thay vì cộng dồn: đổi sum(...) thành
--     max(coalesce(qa.correct_count, 0))::bigint as best_score
drop function if exists public.get_leaderboard();
drop function if exists public.get_leaderboard(integer);
drop function if exists public.get_leaderboard(integer, text);
drop function if exists public.get_leaderboard(text, integer);
create function public.get_leaderboard(
  p_limit        integer default 50,
  p_subject_slug text default null
)
returns table (
  rank        bigint,
  user_id     uuid,
  full_name   text,
  best_score  bigint,
  attempts    bigint
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
      sum(coalesce(qa.correct_count, 0))::bigint as best_score,
      count(*)::bigint as attempts,
      max(qa.created_at) as latest_attempt
    from public.quiz_attempts qa
    left join public.profiles p on p.user_id = qa.user_id
    left join auth.users     u on u.id      = qa.user_id
    where (p_subject_slug is null or trim(p_subject_slug) = '' or qa.subject_slug = p_subject_slug)
      and qa.mode in (
            'exam_30', 'exam_70',
            -- 2 nhãn cũ: các lượt thi thử được lưu trước khi app dùng mã
            -- exam_30 / exam_70. Xoá 2 dòng này nếu không muốn tính lịch sử cũ.
            '30 câu / 20 phút', '70 câu / 60 phút'
          )
    group by qa.user_id, p.full_name, u.email
  ),
  ranked as (
    select
      dense_rank() over (order by best_score desc)::bigint as rank,
      user_id, full_name, best_score, attempts, latest_attempt
    from user_scores
  )
  select r.rank, r.user_id, r.full_name, r.best_score, r.attempts
  from ranked r
  order by r.rank asc, r.latest_attempt asc, r.full_name asc
  limit least(greatest(coalesce(p_limit, 50), 1), 50);
$$;

-- Đồng bộ score_points = correct_count (nếu cột này còn được dùng ở đâu đó)
update public.quiz_attempts
set score_points = coalesce(correct_count, 0)
where score_points is distinct from coalesce(correct_count, 0);


-- =============================================================================
-- 4. QUYỀN THỰC THI
-- =============================================================================

-- Postgres mặc định cấp EXECUTE cho PUBLIC, và Supabase còn có sẵn
-- ALTER DEFAULT PRIVILEGES cấp EXECUTE cho anon với mọi function mới tạo.
-- Vì vậy phải revoke cả hai rồi mới grant lại đúng vai trò cần thiết.
revoke execute on function public.get_subjects()                                     from public;
revoke execute on function public.get_lessons(text)                                  from public;
revoke execute on function public.get_random_questions_by_lesson(integer, text, text) from public, anon;
revoke execute on function public.get_leaderboard(integer, text)                     from public, anon;

-- 2 hàm đầu được gọi ở màn hình chọn môn, trước khi đăng nhập.
grant execute on function public.get_subjects()                                     to anon, authenticated;
grant execute on function public.get_lessons(text)                                  to anon, authenticated;
-- 2 hàm sau bắt buộc phải đăng nhập (get_leaderboard là SECURITY DEFINER,
-- nếu mở cho anon thì người lạ lấy được toàn bộ tên + điểm người dùng).
grant execute on function public.get_random_questions_by_lesson(integer, text, text) to authenticated;
grant execute on function public.get_leaderboard(integer, text)                     to authenticated;

-- Nếu project có sẵn trigger function thì không cần cho gọi qua REST API.
do $$
begin
  if to_regprocedure('public.handle_new_user()') is not null then
    execute 'revoke execute on function public.handle_new_user() from anon, authenticated';
  end if;
  if to_regprocedure('public.quiz_attempts_before_save()') is not null then
    execute 'revoke execute on function public.quiz_attempts_before_save() from anon, authenticated';
  end if;
end $$;

notify pgrst, 'reload schema';


-- =============================================================================
-- 5. KIỂM TRA SAU KHI CHẠY (chạy riêng từng câu để xem kết quả)
-- =============================================================================

-- 5.1 RLS đã bật chưa và mỗi bảng có mấy policy:
-- select c.relname as bang, c.relrowsecurity as rls_bat,
--        (select count(*) from pg_policies p
--         where p.schemaname = 'public' and p.tablename = c.relname) as so_policy
-- from pg_class c join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'public' and c.relkind = 'r'
-- order by c.relname;

-- 5.2 Thử bảng xếp hạng:
-- select * from public.get_leaderboard(50, null);

-- 5.3 Đếm câu hỏi theo môn (kiểm tra subject_slug đã gán đủ chưa):
-- select coalesce(subject_slug, '(chưa gán môn)') as mon, count(*) as so_cau
-- from public.questions group by 1 order by 2 desc;
