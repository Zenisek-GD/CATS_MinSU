@echo off
echo ==========================================
echo CATS Classroom Feature Verification
echo ==========================================
echo.

REM 1. Check PHP version
echo Checking PHP version...
php -r "echo 'PHP version: ' . PHP_VERSION . PHP_EOL;"
echo.

REM 2. Check Composer
echo Checking Composer...
where composer >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Composer installed
    composer --version
) else (
    echo [FAIL] Composer not found
)
echo.

REM 3. Check .env file
echo Checking environment configuration...
if exist .env (
    echo [OK] .env file exists
    findstr /C:"FRONTEND_URL" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo [OK] FRONTEND_URL configured
    ) else (
        echo [WARN] FRONTEND_URL not set in .env
    )
) else (
    echo [FAIL] .env file not found
)
echo.

REM 4. Check database connection
echo Checking database connection...
php artisan db:show >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Database connection successful
) else (
    echo [FAIL] Database connection failed
)
echo.

REM 5. Check migrations
echo Checking migrations...
php artisan migrate:status | findstr /C:"classroom" | findstr /C:"Pending" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARN] Classroom migrations pending
    echo    Run: php artisan migrate
) else (
    echo [OK] All classroom migrations completed
)
echo.

REM 6. Check storage link
echo Checking storage link...
if exist public\storage (
    echo [OK] Storage link exists
) else (
    echo [WARN] Storage link not found
    echo    Run: php artisan storage:link
)
echo.

REM 7. Check QR codes directory
echo Checking QR codes directory...
if exist storage\app\public\qr-codes (
    echo [OK] QR codes directory exists
) else (
    echo [WARN] QR codes directory not found
    echo    Run: mkdir storage\app\public\qr-codes
)
echo.

REM 8. Check required packages
echo Checking required packages...
findstr /C:"simplesoftwareio/simple-qrcode" composer.json >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] QR code package in composer.json
    if exist vendor\simplesoftwareio\simple-qrcode (
        echo [OK] QR code package installed
    ) else (
        echo [WARN] QR code package not installed
        echo    Run: composer install
    )
) else (
    echo [FAIL] QR code package not in composer.json
)
echo.

REM 9. Check models
echo Checking models...
if exist app\Models\Classroom.php (echo [OK] Model: Classroom) else (echo [FAIL] Model missing: Classroom)
if exist app\Models\ClassroomStudent.php (echo [OK] Model: ClassroomStudent) else (echo [FAIL] Model missing: ClassroomStudent)
if exist app\Models\ClassroomQuiz.php (echo [OK] Model: ClassroomQuiz) else (echo [FAIL] Model missing: ClassroomQuiz)
if exist app\Models\ClassroomSimulation.php (echo [OK] Model: ClassroomSimulation) else (echo [FAIL] Model missing: ClassroomSimulation)
if exist app\Models\ClassroomModule.php (echo [OK] Model: ClassroomModule) else (echo [FAIL] Model missing: ClassroomModule)
echo.

REM 10. Check controllers
echo Checking controllers...
if exist app\Http\Controllers\TeacherClassroomController.php (echo [OK] Controller: TeacherClassroomController) else (echo [FAIL] Controller missing: TeacherClassroomController)
if exist app\Http\Controllers\StudentClassroomController.php (echo [OK] Controller: StudentClassroomController) else (echo [FAIL] Controller missing: StudentClassroomController)
echo.

REM 11. Check routes
echo Checking routes...
findstr /C:"TeacherClassroomController" routes\api.php >nul 2>&1
if %errorlevel% equ 0 (echo [OK] Teacher routes configured) else (echo [FAIL] Teacher routes not found)
findstr /C:"StudentClassroomController" routes\api.php >nul 2>&1
if %errorlevel% equ 0 (echo [OK] Student routes configured) else (echo [FAIL] Student routes not found)
echo.

REM 12. Check policy
echo Checking authorization...
if exist app\Policies\ClassroomPolicy.php (echo [OK] ClassroomPolicy exists) else (echo [FAIL] ClassroomPolicy missing)
echo.

REM Summary
echo ==========================================
echo Verification Complete
echo ==========================================
echo.
echo Next steps:
echo 1. Run migrations: php artisan migrate
echo 2. Seed test data: php artisan db:seed --class=ClassroomSeeder
echo 3. Start server: php artisan serve
echo 4. Test API endpoints (see CLASSROOM_API_EXAMPLES.md)
echo.
pause
