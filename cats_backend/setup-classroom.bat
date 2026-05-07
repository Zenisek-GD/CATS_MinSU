@echo off
echo ==========================================
echo CATS Classroom Feature Setup
echo ==========================================
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo [OK] .env file created
) else (
    echo [OK] .env file already exists
)

REM Check if FRONTEND_URL is in .env
findstr /C:"FRONTEND_URL" .env >nul 2>&1
if errorlevel 1 (
    echo Adding FRONTEND_URL to .env...
    echo. >> .env
    echo FRONTEND_URL=http://localhost:3000 >> .env
    echo [OK] FRONTEND_URL added to .env
) else (
    echo [OK] FRONTEND_URL already in .env
)

echo.
echo Installing PHP dependencies...
call composer install

echo.
echo Running database migrations...
call php artisan migrate

echo.
echo Creating storage link...
call php artisan storage:link

echo.
echo Creating QR codes directory...
if not exist storage\app\public\qr-codes mkdir storage\app\public\qr-codes

echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Optional: Run the classroom seeder to create test data:
echo   php artisan db:seed --class=ClassroomSeeder
echo.
echo This will create:
echo   - 1 teacher account (teacher@example.com / password)
echo   - 5 student accounts (student1-5@example.com / password)
echo   - 2 sample classrooms with enrollments
echo.
echo To start the server:
echo   php artisan serve
echo.
pause
