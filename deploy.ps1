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
Fix: Restore Supabase project, patch XSS, refactor scoring, fix changelog & cleanup

Changes:
- app.js: Added escapeHtml() function for XSS mitigation (23 locations)
- schema.sql: Consolidated schema, fixed leaderboard scoring (exam-only cumulative)
- Fixed: subjects policy (app showed 6/8 subjects), removed quiz_attempts UPDATE policy
- Removed icons from sw.js APP_SHELL, updated CACHE_NAME to v2
- vercel.json: Removed dead rewrites
- manifest.webmanifest: Consolidated to single root
- index.html: Fixed changelog structure (all versions now expand), updated footer version to 3.0, normalized title to "Quiz App"
- README.md: Added setup instructions

Cleanup: Removed backup/, fix_leaderboard.sql, fix_leaderboard_total_score.sql, package-lock.json, public/manifest.webmanifest

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Co1t6YSVt141PuKvjL6aAc
"@

git commit -m $commitMessage

echo ""
echo "=== PUSH TO GITHUB ==="
git push origin main

echo ""
echo "Done! Vercel will deploy automatically."
