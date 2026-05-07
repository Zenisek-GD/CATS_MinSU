#!/bin/bash

echo "=========================================="
echo "CATS Classroom Feature Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check PHP version
echo "Checking PHP version..."
PHP_VERSION=$(php -r "echo PHP_VERSION;")
if [[ $(echo "$PHP_VERSION" | cut -d. -f1) -ge 8 ]]; then
    check_pass "PHP version: $PHP_VERSION"
else
    check_fail "PHP version $PHP_VERSION (requires 8.3+)"
fi
echo ""

# 2. Check Composer
echo "Checking Composer..."
if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version | cut -d' ' -f3)
    check_pass "Composer installed: $COMPOSER_VERSION"
else
    check_fail "Composer not found"
fi
echo ""

# 3. Check .env file
echo "Checking environment configuration..."
if [ -f .env ]; then
    check_pass ".env file exists"
    
    if grep -q "FRONTEND_URL" .env; then
        FRONTEND_URL=$(grep FRONTEND_URL .env | cut -d'=' -f2)
        check_pass "FRONTEND_URL configured: $FRONTEND_URL"
    else
        check_warn "FRONTEND_URL not set in .env"
    fi
else
    check_fail ".env file not found"
fi
echo ""

# 4. Check database connection
echo "Checking database connection..."
php artisan db:show &> /dev/null
if [ $? -eq 0 ]; then
    check_pass "Database connection successful"
else
    check_fail "Database connection failed"
fi
echo ""

# 5. Check migrations
echo "Checking migrations..."
PENDING=$(php artisan migrate:status | grep "Pending" | grep "classroom" | wc -l)
if [ $PENDING -gt 0 ]; then
    check_warn "$PENDING classroom migrations pending"
    echo "   Run: php artisan migrate"
else
    check_pass "All classroom migrations completed"
fi
echo ""

# 6. Check storage link
echo "Checking storage link..."
if [ -L public/storage ]; then
    check_pass "Storage link exists"
else
    check_warn "Storage link not found"
    echo "   Run: php artisan storage:link"
fi
echo ""

# 7. Check QR codes directory
echo "Checking QR codes directory..."
if [ -d storage/app/public/qr-codes ]; then
    check_pass "QR codes directory exists"
else
    check_warn "QR codes directory not found"
    echo "   Run: mkdir -p storage/app/public/qr-codes"
fi
echo ""

# 8. Check required packages
echo "Checking required packages..."
if grep -q "simplesoftwareio/simple-qrcode" composer.json; then
    check_pass "QR code package in composer.json"
    
    if [ -d vendor/simplesoftwareio/simple-qrcode ]; then
        check_pass "QR code package installed"
    else
        check_warn "QR code package not installed"
        echo "   Run: composer install"
    fi
else
    check_fail "QR code package not in composer.json"
fi
echo ""

# 9. Check models
echo "Checking models..."
MODELS=("Classroom" "ClassroomStudent" "ClassroomQuiz" "ClassroomSimulation" "ClassroomModule")
for model in "${MODELS[@]}"; do
    if [ -f "app/Models/$model.php" ]; then
        check_pass "Model: $model"
    else
        check_fail "Model missing: $model"
    fi
done
echo ""

# 10. Check controllers
echo "Checking controllers..."
CONTROLLERS=("TeacherClassroomController" "StudentClassroomController")
for controller in "${CONTROLLERS[@]}"; do
    if [ -f "app/Http/Controllers/$controller.php" ]; then
        check_pass "Controller: $controller"
    else
        check_fail "Controller missing: $controller"
    fi
done
echo ""

# 11. Check routes
echo "Checking routes..."
if grep -q "TeacherClassroomController" routes/api.php; then
    check_pass "Teacher routes configured"
else
    check_fail "Teacher routes not found"
fi

if grep -q "StudentClassroomController" routes/api.php; then
    check_pass "Student routes configured"
else
    check_fail "Student routes not found"
fi
echo ""

# 12. Check policy
echo "Checking authorization..."
if [ -f "app/Policies/ClassroomPolicy.php" ]; then
    check_pass "ClassroomPolicy exists"
else
    check_fail "ClassroomPolicy missing"
fi
echo ""

# Summary
echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Run migrations: php artisan migrate"
echo "2. Seed test data: php artisan db:seed --class=ClassroomSeeder"
echo "3. Start server: php artisan serve"
echo "4. Test API endpoints (see CLASSROOM_API_EXAMPLES.md)"
echo ""
