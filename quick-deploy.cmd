@echo off
echo Quick deploying...
git add . && git commit -m "chore: quick deployment update" && git push origin main && vercel --prod
echo.
echo ✅ Done! Check output above for deployment URL.
pause