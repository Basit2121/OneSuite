@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Advanced Deploy Script
echo ========================================
echo.
echo Options:
echo 1. Quick deploy (auto commit message)
echo 2. Custom commit message
echo 3. Deploy only (no git push)
echo 4. Git push only (no deploy)
echo 5. Exit
echo.

set /p choice="Choose option (1-5): "

if "%choice%"=="1" goto quick_deploy
if "%choice%"=="2" goto custom_deploy
if "%choice%"=="3" goto deploy_only
if "%choice%"=="4" goto git_only
if "%choice%"=="5" goto end
echo Invalid choice. Please try again.
pause
goto start

:quick_deploy
set commit_message=chore: automated deployment update
goto git_and_deploy

:custom_deploy
set /p commit_message="Enter commit message: "
if "%commit_message%"=="" (
    set commit_message=chore: automated deployment update
)
goto git_and_deploy

:git_and_deploy
echo.
echo ========================================
echo    Git Operations
echo ========================================

:: Check if we're in a git repository
if not exist ".git" (
    echo ERROR: Not in a git repository!
    pause
    exit /b 1
)

echo Current status:
git status --porcelain

echo.
echo Adding all changes...
git add .

echo.
echo Committing with message: %commit_message%
git commit -m "%commit_message%

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

if errorlevel 1 (
    echo.
    echo ⚠️  No changes to commit or commit failed.
    echo Continuing with deployment anyway...
) else (
    echo ✅ Commit successful!
)

echo.
echo Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo ❌ ERROR: Git push failed!
    pause
    exit /b 1
)

echo ✅ Successfully pushed to GitHub!

:deploy_only
echo.
echo ========================================
echo    Vercel Deployment
echo ========================================

echo Deploying to Vercel production...
vercel --prod

if errorlevel 1 (
    echo ❌ ERROR: Vercel deployment failed!
    pause
    exit /b 1
)

echo ✅ Successfully deployed to Vercel!
goto success

:git_only
echo.
echo ========================================
echo    Git Operations Only
echo ========================================

:: Check if we're in a git repository
if not exist ".git" (
    echo ERROR: Not in a git repository!
    pause
    exit /b 1
)

set /p commit_message="Enter commit message: "
if "%commit_message%"=="" (
    set commit_message=chore: code update
)

echo Adding all changes...
git add .

echo Committing...
git commit -m "%commit_message%

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

echo Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo ❌ ERROR: Git operations failed!
    pause
    exit /b 1
)

echo ✅ Successfully pushed to GitHub!
goto end

:success
echo.
echo ========================================
echo    🎉 DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your application has been successfully deployed!
echo Check the Vercel output above for your deployment URL.
echo.

:end
pause