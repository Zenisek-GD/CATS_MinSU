# Classroom API Testing Examples

## Setup
First, get authentication tokens for teacher and student users.

### Login as Teacher
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@example.com",
    "password": "password"
  }'
```

Save the token from response as `TEACHER_TOKEN`.

### Login as Student
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "password"
  }'
```

Save the token from response as `STUDENT_TOKEN`.

---

## Teacher Endpoints

### 1. Create a Classroom
```bash
curl -X POST http://localhost:8000/api/teacher/classrooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "name": "Cybersecurity 101",
    "description": "Introduction to cybersecurity awareness"
  }'
```

### 2. List All Classrooms
```bash
curl -X GET http://localhost:8000/api/teacher/classrooms \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 3. Get Classroom Details
```bash
curl -X GET http://localhost:8000/api/teacher/classrooms/1 \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 4. Update Classroom
```bash
curl -X PATCH http://localhost:8000/api/teacher/classrooms/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "name": "Advanced Cybersecurity",
    "description": "Deep dive into cybersecurity"
  }'
```

### 5. Get QR Code
```bash
curl -X GET http://localhost:8000/api/teacher/classrooms/1/qr-code \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 6. Regenerate Classroom Code
```bash
curl -X POST http://localhost:8000/api/teacher/classrooms/1/regenerate-code \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 7. Get Students in Classroom
```bash
curl -X GET http://localhost:8000/api/teacher/classrooms/1/students \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 8. Remove Student from Classroom
```bash
curl -X DELETE http://localhost:8000/api/teacher/classrooms/1/students/5 \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 9. Assign Quiz to Classroom
```bash
curl -X POST http://localhost:8000/api/teacher/classrooms/1/quizzes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "quiz_id": 1,
    "due_date": "2026-05-15T23:59:59Z"
  }'
```

### 10. Remove Quiz from Classroom
```bash
curl -X DELETE http://localhost:8000/api/teacher/classrooms/1/quizzes/1 \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 11. Assign Simulation to Classroom
```bash
curl -X POST http://localhost:8000/api/teacher/classrooms/1/simulations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "simulation_id": 1,
    "due_date": "2026-05-20T23:59:59Z"
  }'
```

### 12. Remove Simulation from Classroom
```bash
curl -X DELETE http://localhost:8000/api/teacher/classrooms/1/simulations/1 \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 13. Assign Module to Classroom
```bash
curl -X POST http://localhost:8000/api/teacher/classrooms/1/modules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -d '{
    "module_id": 1,
    "due_date": "2026-05-25T23:59:59Z"
  }'
```

### 14. Remove Module from Classroom
```bash
curl -X DELETE http://localhost:8000/api/teacher/classrooms/1/modules/1 \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 15. Get Classroom Analytics
```bash
curl -X GET http://localhost:8000/api/teacher/classrooms/1/analytics \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

### 16. Delete Classroom
```bash
curl -X DELETE http://localhost:8000/api/teacher/classrooms/1 \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN"
```

---

## Student Endpoints

### 1. Verify Classroom Code (Before Joining)
```bash
curl -X POST http://localhost:8000/api/student/classrooms/verify-code \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -d '{
    "code": "ABC12345"
  }'
```

### 2. Join Classroom by Code
```bash
curl -X POST http://localhost:8000/api/student/classrooms/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -d '{
    "code": "ABC12345"
  }'
```

### 3. List Enrolled Classrooms
```bash
curl -X GET http://localhost:8000/api/student/classrooms \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### 4. Get Classroom Details
```bash
curl -X GET http://localhost:8000/api/student/classrooms/1 \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### 5. Get Assigned Quizzes
```bash
curl -X GET http://localhost:8000/api/student/classrooms/1/quizzes \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### 6. Get Assigned Simulations
```bash
curl -X GET http://localhost:8000/api/student/classrooms/1/simulations \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### 7. Get Assigned Modules
```bash
curl -X GET http://localhost:8000/api/student/classrooms/1/modules \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### 8. Leave Classroom
```bash
curl -X POST http://localhost:8000/api/student/classrooms/1/leave \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

---

## PowerShell Examples (Windows)

### Teacher: Create Classroom
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TEACHER_TOKEN"
}

$body = @{
    name = "Cybersecurity 101"
    description = "Introduction to cybersecurity awareness"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/teacher/classrooms" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

### Student: Join Classroom
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_STUDENT_TOKEN"
}

$body = @{
    code = "ABC12345"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/student/classrooms/join" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

---

## Testing Workflow

### Complete Flow Test

1. **Create teacher and student accounts** (or use seeded accounts)
2. **Login as teacher** and save token
3. **Create a classroom** using teacher token
4. **Get QR code** for the classroom
5. **Note the classroom code** from the response
6. **Login as student** and save token
7. **Verify the code** (optional)
8. **Join classroom** using the code
9. **Assign resources** (quiz, simulation, module) as teacher
10. **View assigned resources** as student
11. **Get analytics** as teacher to see enrollment

### Quick Test Script (Bash)
```bash
#!/bin/bash

# Login as teacher
TEACHER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"password"}')

TEACHER_TOKEN=$(echo $TEACHER_RESPONSE | jq -r '.token')
echo "Teacher Token: $TEACHER_TOKEN"

# Create classroom
CLASSROOM_RESPONSE=$(curl -s -X POST http://localhost:8000/api/teacher/classrooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{"name":"Test Classroom","description":"Testing"}')

CLASSROOM_CODE=$(echo $CLASSROOM_RESPONSE | jq -r '.classroom.code')
CLASSROOM_ID=$(echo $CLASSROOM_RESPONSE | jq -r '.classroom.id')
echo "Classroom Code: $CLASSROOM_CODE"
echo "Classroom ID: $CLASSROOM_ID"

# Login as student
STUDENT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@example.com","password":"password"}')

STUDENT_TOKEN=$(echo $STUDENT_RESPONSE | jq -r '.token')
echo "Student Token: $STUDENT_TOKEN"

# Join classroom
JOIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/student/classrooms/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d "{\"code\":\"$CLASSROOM_CODE\"}")

echo "Join Response: $JOIN_RESPONSE"
```

---

## Common Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error

## Error Response Format
```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  }
}
```
