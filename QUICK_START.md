# 🚀 Classroom Feature - Quick Start Guide

## ⚡ 5-Minute Setup

### Windows
```bash
cd cats_backend
setup-classroom.bat
php artisan db:seed --class=ClassroomSeeder
php artisan serve
```

### Linux/Mac
```bash
cd cats_backend
chmod +x setup-classroom.sh
./setup-classroom.sh
php artisan db:seed --class=ClassroomSeeder
php artisan serve
```

## 🧪 Test Accounts (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Teacher | teacher@example.com | password |
| Student 1 | student1@example.com | password |
| Student 2 | student2@example.com | password |
| Student 3 | student3@example.com | password |
| Student 4 | student4@example.com | password |
| Student 5 | student5@example.com | password |

## 📋 Quick Test Flow

### 1. Login as Teacher
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password"}'
```
**Save the token!**

### 2. Create Classroom
```bash
curl -X POST http://localhost:8000/api/teacher/classrooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Class","description":"Testing"}'
```
**Note the classroom code!**

### 3. Get QR Code
```bash
curl -X GET http://localhost:8000/api/teacher/classrooms/1/qr-code \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Login as Student
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@example.com","password":"password"}'
```
**Save the token!**

### 5. Join Classroom
```bash
curl -X POST http://localhost:8000/api/student/classrooms/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"code":"YOUR_CLASSROOM_CODE"}'
```

## 🎯 Key Endpoints

### Teacher
- `POST /api/teacher/classrooms` - Create classroom
- `GET /api/teacher/classrooms` - List classrooms
- `GET /api/teacher/classrooms/{id}/qr-code` - Get QR code
- `POST /api/teacher/classrooms/{id}/quizzes` - Assign quiz
- `GET /api/teacher/classrooms/{id}/analytics` - View stats

### Student
- `POST /api/student/classrooms/join` - Join by code
- `GET /api/student/classrooms` - List enrolled
- `GET /api/student/classrooms/{id}/quizzes` - View quizzes
- `POST /api/student/classrooms/{id}/leave` - Leave class

## 📱 Frontend Integration

### Install QR Scanner
```bash
npm install html5-qrcode
```

### Basic QR Scanner (React)
```jsx
import { Html5QrcodeScanner } from 'html5-qrcode';

function QRScanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10 });
    scanner.render(
      (decodedText) => {
        const code = decodedText.split('/').pop();
        onScan(code);
      }
    );
  }, []);

  return <div id="qr-reader"></div>;
}
```

## 🔧 Troubleshooting

### QR Codes Not Showing?
```bash
php artisan storage:link
mkdir -p storage/app/public/qr-codes
```

### Need to Change User Role?
```sql
UPDATE users SET role = 'teacher' WHERE email = 'user@example.com';
UPDATE users SET role = 'student' WHERE email = 'user@example.com';
```

### Check Migrations
```bash
php artisan migrate:status
```

### Reset Everything
```bash
php artisan migrate:fresh
php artisan db:seed --class=ClassroomSeeder
```

## 📚 Full Documentation

- **Complete Guide:** `cats_backend/CLASSROOM_FEATURE.md`
- **API Examples:** `cats_backend/CLASSROOM_API_EXAMPLES.md`
- **Frontend Code:** `cats_backend/FRONTEND_EXAMPLES.md`
- **Implementation Details:** `CLASSROOM_IMPLEMENTATION_SUMMARY.md`

## 🎨 What You Get

✅ Teacher can create classrooms  
✅ Auto-generated QR codes  
✅ Students scan QR to join  
✅ Manual code entry option  
✅ Assign quizzes, simulations, modules  
✅ Monitor student progress  
✅ Role-based access control  
✅ Complete API documentation  
✅ Frontend examples (React/Vue/Angular)  
✅ Test data seeder  

## 🚦 Status Check

After setup, verify everything works:

```bash
# Check database
php artisan migrate:status

# Check storage link
ls -la public/storage

# Check QR codes directory
ls -la storage/app/public/qr-codes

# Test API
curl http://localhost:8000/api/me -H "Authorization: Bearer YOUR_TOKEN"
```

## 💡 Pro Tips

1. **Use the seeder** for instant test data
2. **Check FRONTEND_URL** in .env matches your frontend
3. **Storage link** must exist for QR codes
4. **Test with Postman** or curl before frontend integration
5. **Read the docs** - they have everything you need!

## 🆘 Need Help?

1. Check `CLASSROOM_FEATURE.md` for detailed docs
2. Review `CLASSROOM_API_EXAMPLES.md` for API usage
3. See `FRONTEND_EXAMPLES.md` for UI code
4. Verify environment setup (PHP, Composer, Database)

---

**Ready to go!** 🎉 Start with the setup script, seed the data, and test the API!
