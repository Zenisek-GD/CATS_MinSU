# Classroom Feature Documentation

## Overview
The Classroom feature enables teachers to create virtual classrooms, invite students via QR codes, and assign learning resources (quizzes, simulations, and training modules) to their classes.

## Database Schema

### New Tables
1. **classrooms** - Stores classroom information
2. **classroom_students** - Junction table for student enrollment
3. **classroom_quizzes** - Assigned quizzes for classrooms
4. **classroom_simulations** - Assigned simulations for classrooms
5. **classroom_modules** - Assigned training modules for classrooms

### User Roles
- **teacher** - Can create and manage classrooms
- **student** - Can join classrooms and access assigned resources
- **admin** - Has full access to all features

## Installation Steps

### 1. Install Dependencies
```bash
cd cats_backend
composer install
```

This will install the `simplesoftwareio/simple-qrcode` package for QR code generation.

### 2. Update Environment Variables
Add to your `.env` file:
```env
FRONTEND_URL=http://localhost:3000
```

### 3. Run Migrations
```bash
php artisan migrate
```

### 4. Create Storage Link (if not already created)
```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public` for QR code access.

### 5. Update User Roles
Update existing users to have the new roles:
```sql
-- Make a user a teacher
UPDATE users SET role = 'teacher' WHERE email = 'teacher@example.com';

-- Make a user a student
UPDATE users SET role = 'student' WHERE email = 'student@example.com';
```

## API Endpoints

### Teacher Endpoints (Requires `teacher` or `admin` role)

#### Classroom Management
- `GET /api/teacher/classrooms` - List all classrooms
- `POST /api/teacher/classrooms` - Create a new classroom
- `GET /api/teacher/classrooms/{id}` - Get classroom details
- `PATCH /api/teacher/classrooms/{id}` - Update classroom
- `DELETE /api/teacher/classrooms/{id}` - Delete classroom

#### QR Code
- `GET /api/teacher/classrooms/{id}/qr-code` - Get QR code for classroom
- `POST /api/teacher/classrooms/{id}/regenerate-code` - Regenerate classroom code

#### Student Management
- `GET /api/teacher/classrooms/{id}/students` - List students in classroom
- `DELETE /api/teacher/classrooms/{id}/students/{studentId}` - Remove student

#### Resource Assignment
- `POST /api/teacher/classrooms/{id}/quizzes` - Assign quiz
- `DELETE /api/teacher/classrooms/{id}/quizzes/{quizId}` - Remove quiz
- `POST /api/teacher/classrooms/{id}/simulations` - Assign simulation
- `DELETE /api/teacher/classrooms/{id}/simulations/{simulationId}` - Remove simulation
- `POST /api/teacher/classrooms/{id}/modules` - Assign module
- `DELETE /api/teacher/classrooms/{id}/modules/{moduleId}` - Remove module

#### Analytics
- `GET /api/teacher/classrooms/{id}/analytics` - Get classroom statistics

### Student Endpoints (Requires `student`, `user`, or `admin` role)

#### Classroom Access
- `GET /api/student/classrooms` - List enrolled classrooms
- `POST /api/student/classrooms/join` - Join classroom by code
- `POST /api/student/classrooms/verify-code` - Verify classroom code
- `GET /api/student/classrooms/{id}` - Get classroom details
- `POST /api/student/classrooms/{id}/leave` - Leave classroom

#### Assigned Resources
- `GET /api/student/classrooms/{id}/quizzes` - Get assigned quizzes
- `GET /api/student/classrooms/{id}/simulations` - Get assigned simulations
- `GET /api/student/classrooms/{id}/modules` - Get assigned modules

## Usage Examples

### Teacher: Create a Classroom
```bash
POST /api/teacher/classrooms
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Cybersecurity 101",
  "description": "Introduction to cybersecurity awareness"
}
```

Response:
```json
{
  "message": "Classroom created successfully",
  "classroom": {
    "id": 1,
    "teacher_id": 2,
    "name": "Cybersecurity 101",
    "description": "Introduction to cybersecurity awareness",
    "code": "ABC12345",
    "qr_code_path": "qr-codes/classroom-1-ABC12345.png",
    "status": "active",
    "created_at": "2026-05-04T10:00:00.000000Z",
    "updated_at": "2026-05-04T10:00:00.000000Z"
  }
}
```

### Teacher: Get QR Code
```bash
GET /api/teacher/classrooms/1/qr-code
Authorization: Bearer {token}
```

Response:
```json
{
  "qr_code_url": "/storage/qr-codes/classroom-1-ABC12345.png",
  "classroom_code": "ABC12345",
  "join_url": "http://localhost:3000/join-classroom/ABC12345"
}
```

### Teacher: Assign a Quiz
```bash
POST /api/teacher/classrooms/1/quizzes
Authorization: Bearer {token}
Content-Type: application/json

{
  "quiz_id": 5,
  "due_date": "2026-05-15T23:59:59Z"
}
```

### Student: Join Classroom
```bash
POST /api/student/classrooms/join
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "ABC12345"
}
```

Response:
```json
{
  "message": "Successfully joined classroom",
  "classroom": {
    "id": 1,
    "name": "Cybersecurity 101",
    "description": "Introduction to cybersecurity awareness",
    "teacher": {
      "id": 2,
      "name": "John Teacher",
      "email": "teacher@example.com"
    }
  }
}
```

### Student: Verify Code (Before Joining)
```bash
POST /api/student/classrooms/verify-code
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "ABC12345"
}
```

Response:
```json
{
  "valid": true,
  "classroom": {
    "id": 1,
    "name": "Cybersecurity 101",
    "description": "Introduction to cybersecurity awareness",
    "teacher": {
      "id": 2,
      "name": "John Teacher",
      "email": "teacher@example.com"
    }
  }
}
```

### Student: Get Assigned Quizzes
```bash
GET /api/student/classrooms/1/quizzes
Authorization: Bearer {token}
```

Response:
```json
{
  "quizzes": [
    {
      "id": 5,
      "title": "Phishing Awareness Quiz",
      "description": "Test your knowledge about phishing attacks",
      "pivot": {
        "assigned_at": "2026-05-04T10:00:00.000000Z",
        "due_date": "2026-05-15T23:59:59.000000Z",
        "is_active": true
      }
    }
  ]
}
```

## Frontend Integration

### QR Code Scanner Implementation
For the student side, you'll need to implement a QR code scanner. Here's a recommended approach:

#### Using React (with `react-qr-scanner` or `html5-qrcode`)

```bash
npm install html5-qrcode
```

```jsx
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

function QRScanner() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        // Extract classroom code from URL
        const code = decodedText.split('/').pop();
        
        // Call API to join classroom
        fetch('/api/student/classrooms/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ code })
        })
        .then(res => res.json())
        .then(data => {
          console.log('Joined classroom:', data);
          scanner.clear();
        });
      },
      (error) => {
        console.warn('QR scan error:', error);
      }
    );

    return () => scanner.clear();
  }, []);

  return <div id="qr-reader" style={{ width: '100%' }}></div>;
}
```

### Manual Code Entry
Also provide a manual code entry option:

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
      body: JSON.stringify({ code: code.toUpperCase() })
    });
    
    const data = await response.json();
    // Handle response
  };

  return (
    <div>
      <input 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter classroom code"
        maxLength={8}
      />
      <button onClick={handleJoin}>Join Classroom</button>
    </div>
  );
}
```

## Security Considerations

1. **Authorization**: All endpoints use Laravel policies to ensure teachers can only manage their own classrooms
2. **Role-based Access**: Middleware ensures only appropriate roles can access endpoints
3. **Unique Codes**: Classroom codes are 8-character unique strings
4. **QR Code Storage**: QR codes are stored in `storage/app/public/qr-codes/`
5. **Student Removal**: Teachers can remove students, but students can also leave voluntarily

## Monitoring and Analytics

Teachers can monitor:
- Total students enrolled
- Assigned resources (quizzes, simulations, modules)
- Student progress on modules
- Simulation completion rates

Access via: `GET /api/teacher/classrooms/{id}/analytics`

## Troubleshooting

### QR Codes Not Displaying
1. Ensure storage link is created: `php artisan storage:link`
2. Check file permissions on `storage/app/public/qr-codes/`
3. Verify `FRONTEND_URL` is set in `.env`

### Students Can't Join
1. Verify classroom status is 'active'
2. Check that the code is correct (case-insensitive)
3. Ensure student has proper role (`student`, `user`, or `admin`)

### Role Issues
1. Check user role in database: `SELECT id, name, email, role FROM users;`
2. Update role if needed: `UPDATE users SET role = 'teacher' WHERE id = X;`

## Future Enhancements

Potential additions:
- Real-time notifications when students join
- Classroom announcements
- Assignment deadlines with reminders
- Grade tracking and reporting
- Bulk student import via CSV
- Classroom templates
- Student performance dashboards
- Export classroom data
