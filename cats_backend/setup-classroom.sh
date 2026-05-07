#!/bin/bash

echo "=========================================="
echo "CATS Classroom Feature Setup"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

# Check if FRONTEND_URL is in .env
if ! grep -q "FRONTEND_URL" .env; then
    echo "Adding FRONTEND_URL to .env..."
    echo "" >> .env
    echo "FRONTEND_URL=http://localhost:3000" >> .env
    echo "✓ FRONTEND_URL added to .env"
else
    echo "✓ FRONTEND_URL already in .env"
fi

echo ""
echo "Installing PHP dependencies..."
composer install

echo ""
echo "Running database migrations..."
php artisan migrate

echo ""
echo "Creating storage link..."
php artisan storage:link

echo ""
echo "Creating QR codes directory..."
mkdir -p storage/app/public/qr-codes
chmod -R 775 storage/app/public/qr-codes

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Optional: Run the classroom seeder to create test data:"
echo "  php artisan db:seed --class=ClassroomSeeder"
echo ""
echo "This will create:"
echo "  - 1 teacher account (teacher@example.com / password)"
echo "  - 5 student accounts (student1-5@example.com / password)"
echo "  - 2 sample classrooms with enrollments"
echo ""
echo "To start the server:"
echo "  php artisan serve"
echo ""
