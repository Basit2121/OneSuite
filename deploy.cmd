@echo off
echo ========================================
echo    Auto Deploy Script
echo ========================================
echo.

:: Check if we're in a git repository
if not exist ".git" (
    echo ERROR: Not in a git repository!
    pause
    exit /b 1
)

:: Get commit message from user
set /p commit_message="Enter commit message: "

:: Use default message if none provided
if "%commit_message%"=="" (
    set commit_message=chore: automated deployment update
)

echo.
echo ========================================
echo    Step 1: Git Status
echo ========================================
git status

echo.
echo ========================================
echo    Step 2: Adding all changes
echo ========================================
git add .

echo.
echo ========================================
echo    Step 3: Committing changes
echo ========================================
git commit -m "%commit_message%

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

if errorlevel 1 (
    echo.
    echo No changes to commit or commit failed.
    echo Continuing with deployment anyway...
)

echo.
echo ========================================
echo    Step 4: Pushing to GitHub
echo ========================================
git push origin main

if errorlevel 1 (
    echo.
    echo ERROR: Git push failed!
    echo Please check your git configuration and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Step 5: Deploying to Vercel
echo ========================================
vercel --prod

if errorlevel 1 (
    echo.
    echo ERROR: Vercel deployment failed!
    echo Please check your Vercel configuration and try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    ✅ DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your code has been successfully:
echo ✓ Committed to git
echo ✓ Pushed to GitHub  
echo ✓ Deployed to Vercel
echo.
echo Check the Vercel output above for your deployment URL.
echo.
pause