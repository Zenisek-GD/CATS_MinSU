# 🎓 CATS Classroom Management System

A comprehensive teacher-student classroom management system with QR code functionality for the Cyber Awareness Training System (CATS).

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Frontend Integration](#frontend-integration)
- [Architecture](#architecture)
- [Security](#security)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## ✨ Features

### For Teachers
- ✅ Create and manage multiple classrooms
- ✅ Generate unique QR codes for each classroom
- ✅ Share classroom codes via QR or text
- ✅ Manage student enrollments
- ✅ Assign quizzes with due dates
- ✅ Assign simulations with due dates
- ✅ Assign training modules with due dates
- ✅ View classroom analytics and student progress
- ✅ Archive/activate classrooms
- ✅ Regenerate classroom codes

### For Students
- ✅ Join classrooms by scanning QR codes
- ✅ Join classrooms by entering codes manually
- ✅ View all enrolled classrooms
- ✅ Access assigned quizzes, simulations, and modules
- ✅ See assignment due dates
- ✅ Leave classrooms voluntarily

### Technical Features
- ✅ RESTful API design
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Laravel policies for authorization
- ✅ Automatic QR code generation
- ✅ Comprehensive validation
- ✅ Database relationships with Eloquent ORM
- ✅ Seeder for test data

## 🚀 Quick Start

### Prerequisites
- PHP 8.3+
- Composer
- MySQL/PostgreSQL/SQLite
- Node.js (for frontend)

### Installation (Windows)
```bash
cd cats_backend
setup-classroom.bat
php artisan db:seed --class=ClassroomSeeder
php artisan serve
```

### Installation (Linux/Mac)
```bash
cd cats_backend
chmod +x setup-classroom.sh
./setup-classroom.sh
php artisan db:seed --class=ClassroomSeeder
php artisan serve
```

### Test Accounts
After seeding:
- **Teacher:** teacher@example.com / password
- **Students:** student1-5@example.com / password

## 📦 Installation

### Step 1: Install Dependencies
```bash
composer install
```

This installs:
- Laravel framework
- JWT authentication
- QR code generator (simplesoftwareio/simple-qrcode)

### Step 2: Configure Environment
```bash
# Copy .env.example if needed
cp .env.example .env

# Add frontend URL
echo "FRONTEND_URL=http://localhost:3000" >> .env

# Generate app key if needed
php artisan key:generate
```

### Step 3: Run Migrations
```bash
php artisan migrate
```

This creates:
- `classrooms` table
- `classroom_students` table
- `classroom_quizzes` table
- `classroom_simulations` table
- `classroom_modules` table
- Updates `users` table with teacher/student roles

### Step 4: Setup Storage
```bash
# Create symbolic link
php artisan storage:link

# Create QR codes directory
mkdir -p storage/app/public/qr-codes
```

### Step 5: Seed Test Data (Optional)
```bash
php artisan db:seed --class=ClassroomSeeder
```

Creates:
- 1 teacher account
- 5 student accounts
- 2 sample classrooms
- Sample enrollments and assignments

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All endpoints require JWT authentication:
```
Authorization: Bearer {your-jwt-token}
```

### Teacher Endpoints

#### Create Classroom
```http
POST /teacher/classrooms
Content-Type: application/json

{
  "name": "Cybersecurity 101",
  "description": "Introduction to cybersecurity"
}
```

#### List Classrooms
```http
GET /teacher/classrooms
```

#### Get Classroom Details
```http
GET /teacher/classrooms/{id}
```

#### Get QR Code
```http
GET /teacher/classrooms/{id}/qr-code
```

#### Assign Quiz
```http
POST /teacher/classrooms/{id}/quizzes
Content-Type: application/json

{
  "quiz_id": 1,
  "due_date": "2026-05-15T23:59:59Z"
}
```

#### Get Analytics
```http
GET /teacher/classrooms/{id}/analytics
```

### Student Endpoints

#### Join Classroom
```http
POST /student/classrooms/join
Content-Type: application/json

{
  "code": "ABC12345"
}
```

#### List Enrolled Classrooms
```http
GET /student/classrooms
```

#### Get Assigned Quizzes
```http
GET /student/classrooms/{id}/quizzes
```

#### Leave Classroom
```http
POST /student/classrooms/{id}/leave
```

### Complete API Reference
See [CLASSROOM_API_EXAMPLES.md](CLASSROOM_API_EXAMPLES.md) for all endpoints with curl examples.

## 🎨 Frontend Integration

### Install QR Scanner
```bash
npm install html5-qrcode
```

### React Example - QR Scanner
```jsx
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

function QRScanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 }
    );

    scanner.render(
      (decodedText) => {
        const code = decodedText.split('/').pop();
        onScan(code);
        scanner.clear();
      }
    );

    return () => scanner.clear();
  }, []);

  return <div id="qr-reader"></div>;
}
```

### React Example - Join Classroom
```jsx
function JoinClassroom() {
  const [code, setCode] = useState('');

  const handleJoin = async () => {
    const response = await fetch('/api/student/classrooms/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code })
    });
    
    const data = await response.json();
    console.log('Joined:', data);
  };

  return (
    <div>
      <input 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter code"
      />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
}
```

### Complete Frontend Examples
See [FRONTEND_EXAMPLES.md](FRONTEND_EXAMPLES.md) for React, Vue, and Angular implementations.

## 🏗️ Architecture

### Database Schema
```
users (teacher_id, student_id)
  ↓
classrooms (code, qr_code_path)
  ↓
  ├── classroom_students (enrollment)
  ├── classroom_quizzes (assignments)
  ├── classroom_simulations (assignments)
  └── classroom_modules (assignments)
```

### Request Flow
```
Client → Route → Middleware → Controller → Policy → Model → Database
```

### Components
- **Controllers:** Handle HTTP requests
- **Models:** Database interactions
- **Policies:** Authorization logic
- **Middleware:** Authentication & role checking
- **Migrations:** Database schema
- **Seeders:** Test data

See [CLASSROOM_ARCHITECTURE.md](../CLASSROOM_ARCHITECTURE.md) for detailed diagrams.

## 🔒 Security

### Authentication
- JWT tokens for API authentication
- Token expiration and refresh
- Secure password hashing

### Authorization
- Role-based access control (teacher, student, admin)
- Laravel policies for resource ownership
- Middleware for route protection

### Data Protection
- Input validation on all endpoints
- SQL injection prevention (Eloquent ORM)
- XSS protection
- CSRF protection

### QR Code Security
- Unique 8-character codes
- Collision-free generation
- Code regeneration capability
- Classroom status checks

## 🧪 Testing

### Manual Testing

#### 1. Test Teacher Flow
```bash
# Login as teacher
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password"}'

# Create classroom
curl -X POST http://localhost:8000/api/teacher/classrooms \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Class","description":"Testing"}'

# Get QR code
curl -X GET http://localhost:8000/api/teacher/classrooms/1/qr-code \
  -H "Authorization: Bearer {token}"
```

#### 2. Test Student Flow
```bash
# Login as student
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@example.com","password":"password"}'

# Join classroom
curl -X POST http://localhost:8000/api/student/classrooms/join \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"code":"ABC12345"}'

# View classrooms
curl -X GET http://localhost:8000/api/student/classrooms \
  -H "Authorization: Bearer {token}"
```

### Automated Testing
```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter ClassroomTest
```

## 🔧 Troubleshooting

### QR Codes Not Displaying

**Problem:** QR code images not showing in frontend

**Solution:**
```bash
# Create storage link
php artisan storage:link

# Check permissions
chmod -R 775 storage/app/public/qr-codes

# Verify .env
echo $FRONTEND_URL
```

### Students Can't Join Classroom

**Problem:** "Invalid classroom code" error

**Solutions:**
1. Verify classroom status is 'active'
2. Check code is correct (case-insensitive)
3. Ensure student has proper role
4. Check database connection

```sql
-- Check classroom
SELECT * FROM classrooms WHERE code = 'ABC12345';

-- Check student role
SELECT id, email, role FROM users WHERE email = 'student@example.com';
```

### Role Issues

**Problem:** "Forbidden" error when accessing endpoints

**Solution:**
```sql
-- Update user role
UPDATE users SET role = 'teacher' WHERE email = 'user@example.com';
UPDATE users SET role = 'student' WHERE email = 'user@example.com';
```

### Migration Errors

**Problem:** Migration fails or tables already exist

**Solution:**
```bash
# Check migration status
php artisan migrate:status

# Rollback last migration
php artisan migrate:rollback

# Fresh migration (WARNING: deletes all data)
php artisan migrate:fresh

# Re-seed
php artisan db:seed --class=ClassroomSeeder
```

### Storage Link Issues

**Problem:** Symbolic link not working

**Solution:**
```bash
# Remove old link
rm public/storage

# Recreate link
php artisan storage:link

# Verify
ls -la public/storage
```

## 📖 Documentation Files

- **[CLASSROOM_FEATURE.md](CLASSROOM_FEATURE.md)** - Complete feature documentation
- **[CLASSROOM_API_EXAMPLES.md](CLASSROOM_API_EXAMPLES.md)** - API testing examples
- **[FRONTEND_EXAMPLES.md](FRONTEND_EXAMPLES.md)** - Frontend integration code
- **[CLASSROOM_ARCHITECTURE.md](../CLASSROOM_ARCHITECTURE.md)** - System architecture diagrams
- **[CLASSROOM_IMPLEMENTATION_SUMMARY.md](../CLASSROOM_IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[QUICK_START.md](../QUICK_START.md)** - Quick reference guide

## 🤝 Contributing

### Adding New Features

1. Create migration: `php artisan make:migration create_feature_table`
2. Create model: `php artisan make:model Feature`
3. Create controller: `php artisan make:controller FeatureController`
4. Add routes in `routes/api.php`
5. Update documentation

### Code Style

Follow Laravel conventions:
- PSR-12 coding standard
- Eloquent ORM for database
- Resource controllers
- Form request validation

### Testing

Write tests for new features:
```bash
php artisan make:test FeatureTest
```

## 📝 License

This feature is part of the CATS system. See main project license.

## 🆘 Support

### Getting Help

1. Check documentation files
2. Review API examples
3. Test with seeded data
4. Verify environment setup

### Common Commands

```bash
# Check Laravel version
php artisan --version

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# List routes
php artisan route:list

# Check database connection
php artisan db:show

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Start server
php artisan serve
```

## 🎯 Next Steps

1. ✅ Complete installation
2. ✅ Test API endpoints
3. ✅ Implement frontend
4. ✅ Customize for your needs
5. ✅ Deploy to production

## 📊 Statistics

- **6** Database migrations
- **5** Eloquent models
- **2** Controllers
- **23** API endpoints
- **1** Authorization policy
- **100%** Documentation coverage

---

**Built with ❤️ for CATS - Cyber Awareness Training System**

For questions or issues, refer to the documentation files or check the troubleshooting section.
