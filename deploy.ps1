cd "T:\CT app"

echo "=== GIT STATUS ==="
git status

echo ""
echo "=== DELETE 5 OLD FILES ==="
git rm -r --ignore-unmatch backup
git rm --ignore-unmatch fix_leaderboard.sql
git rm --ignore-unmatch fix_leaderboard_total_score.sql
git rm --ignore-unmatch package-lock.json
git rm --ignore-unmatch "public/manifest.webmanifest"

echo "Old files deleted"

echo ""
echo "=== ADD ALL CHANGES ==="
git add -A
git status

echo ""
echo "=== COMMIT ==="

$commitMessage = @"
Add class-based quiz feature + login UX/mobile fixes

Class feature (Lop hoc - kiem tra theo lop):
- schema.sql: 6 new tables (classes, class_members, class_quizzes,
  class_quiz_questions, class_quiz_attempts, class_quiz_answers) + RLS +
  17 SECURITY DEFINER RPC functions (create_class, join_class_by_code,
  create_class_quiz, start_class_quiz_attempt, submit_class_quiz_attempt,
  get_class_quiz_leaderboard, ...). Server-side grading, answers not
  exposed to client before submission. Already applied directly to the
  live Supabase project via MCP - this push only needs to sync the file.
- app.js: ~1000 new lines - full "Lop hoc" UI module (class list/detail,
  member management, quiz creation, quiz taking with timer, review,
  admin leaderboard), event delegation, join-by-link (?join=CODE) support.
- index.html: new sidebar nav item + classCard section container.
- Fixed pre-existing unclosed <div class="app-shell"> tag.
- README.md: documented the new feature + known Phase 1 limitations.

Login UX / mobile login fixes:
- emailInput/passwordInput: added autocomplete, autocapitalize="none",
  autocorrect="off", spellcheck="false" to reduce mobile keyboard
  mis-entry and improve browser autofill accuracy.
- Added a show/hide password toggle (eye icon) on the login, register,
  and confirm-password fields so users can verify exactly what was
  typed before submitting - helps diagnose stale-autofill mismatches
  on mobile.
- Cache-bust bumped to app.js?v=20260917-1.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Co1t6YSVt141PuKvjL6aAc
"@

git commit -m $commitMessage

echo ""
echo "=== PUSH TO GITHUB ==="
git push origin main

echo ""
echo "Done! Vercel will deploy automatically."
