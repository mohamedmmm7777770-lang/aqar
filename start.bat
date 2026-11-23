@echo off
chcp 65001 >nul
title سيرفر عقار - Aqar Server

cd /d "%~dp0"

echo ===================================================
echo        جاري تشغيل سيرفر عقار (Aqar Server)
echo ===================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=%PATH%;C:\Program Files\nodejs"
    ) else (
        echo [خطأ] لم يتم العثور على Node.js على جهازك!
        echo يرجى تحميل وتثبيت Node.js من: https://nodejs.org
        echo.
        pause
        exit /b 1
    )
)

if not exist "node_modules\" (
    echo [تنبيه] مجلد الحزم غير موجود، جاري التثبيت...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [خطأ] فشل تثبيت الحزم node_modules.
        pause
        exit /b 1
    )
)

echo السيرفر سيعمل على الرابط: http://localhost:3000
echo جاري فتح المتصفح...
echo للإنهاء: اضغط Ctrl + C ثم أجب بـ Y
echo ===================================================
echo.

start "" http://localhost:3000

call npm run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [خطأ] توقف السيرفر أو حدث خطأ أثناء التشغيل.
)

pause
