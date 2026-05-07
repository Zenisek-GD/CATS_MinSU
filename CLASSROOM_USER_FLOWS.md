# 🔄 Classroom System User Flows

Visual guides for understanding how teachers and students interact with the classroom system.

## 📋 Table of Contents
1. [Teacher Flows](#teacher-flows)
2. [Student Flows](#student-flows)
3. [System Flows](#system-flows)

---

## 👨‍🏫 Teacher Flows

### Flow 1: Create a Classroom

```
START
  │
  ├─► Login as Teacher
  │     │
  │     ├─► Navigate to "Create Classroom"
  │     │
  │     ├─► Enter classroom details:
  │     │   • Name: "Cybersecurity 101"
  │     │   • Description: "Introduction to cyber awareness"
  │     │
  │     ├─► Click "Create"
  │     │
  │     ├─► System generates:
  │     │   • Unique 8-character code (e.g., "ABC12345")
  │     │   • QR code image
  │     │   • Join URL
  │     │
  │     ├─► Classroom created successfully!
  │     │
  │     └─► Teacher sees:
  │           • Classroom dashboard
  │           • QR code for sharing
  │           • Classroom code
  │           • Share options
  │
END
```

### Flow 2: Share Classroom with Students

```
START (Classroom exists)
  │
  ├─► Option A: Share QR Code
  │     │
  │     ├─► Download QR code image
  │     ├─► Share via:
  │     │   • Email attachment
  │     │   • Learning management system
  │     │   • Print and display in class
  │     │   • Social media/messaging apps
  │     │
  │     └─► Students scan to join
  │
  ├─► Option B: Share Code
  │     │
  │     ├─► Copy classroom code "ABC12345"
  │     ├─► Share via:
  │     │   • Email
  │     │   • SMS
  │     │   • Announcement
  │     │   • Whiteboard
  │     │
  │     └─► Students enter code to join
  │
  └─► Option C: Share URL
        │
        ├─► Copy join URL
        ├─► Share via:
        │   • Email link
        │   • Website
        │   • LMS
        │
        └─► Students click to join
END
```

### Flow 3: Assign a Quiz to Classroom

```
START (Classroom has students)
  │
  ├─► Navigate to classroom
  │
  ├─► Click "Assign Quiz"
  │
  ├─► Select quiz from list:
  │   • "Phishing Awareness Quiz"
  │   • "Password Security Quiz"
  │   • "Social Engineering Quiz"
  │   • etc.
  │
  ├─► Set due date (optional):
  │   • May 15, 2026, 11:59 PM
  │
  ├─► Click "Assign"
  │
  ├─► System creates assignment
  │
  ├─► All students in classroom can now see:
  │   • Quiz in their dashboard
  │   • Due date
  │   • Quiz details
  │
  └─► Teacher can monitor:
      • Who started the quiz
      • Who completed it
      • Scores
      • Completion rate
END
```

### Flow 4: Monitor Student Progress

```
START
  │
  ├─► Navigate to classroom
  │
  ├─► Click "Analytics" or "Students"
  │
  ├─► View dashboard showing:
  │   │
  │   ├─► Overall Statistics:
  │   │   • Total students: 25
  │   │   • Active assignments: 3
  │   │   • Completion rate: 78%
  │   │
  │   ├─► Per-Student Progress:
  │   │   • Student name
  │   │   • Quizzes completed
  │   │   • Simulations completed
  │   │   • Modules completed
  │   │   • Last activity
  │   │
  │   └─► Per-Assignment Progress:
  │       • Assignment name
  │       • Students completed
  │       • Average score
  │       • Due date status
  │
  ├─► Filter/Sort data:
  │   • By completion status
  │   • By score
  │   • By date
  │
  └─► Export data (optional):
      • CSV export
      • PDF report
END
```

### Flow 5: Remove a Student

```
START
  │
  ├─► Navigate to classroom
  │
  ├─► Click "Students" tab
  │
  ├─► Find student to remove
  │
  ├─► Click "Remove" button
  │
  ├─► Confirm removal
  │   "Are you sure you want to remove John Doe?"
  │   [Cancel] [Remove]
  │
  ├─► Student removed
  │
  ├─► Student loses access to:
  │   • Classroom
  │   • Assigned resources
  │   • Classroom materials
  │
  └─► Student can rejoin if:
      • Teacher allows
      • Has valid code
      • Classroom is active
END
```

---

## 👨‍🎓 Student Flows

### Flow 1: Join Classroom via QR Code

```
START
  │
  ├─► Login as Student
  │
  ├─► Navigate to "Join Classroom"
  │
  ├─► Select "Scan QR Code"
  │
  ├─► Camera activates
  │
  ├─► Point camera at QR code
  │
  ├─► System scans and extracts code
  │
  ├─► System verifies:
  │   • Code is valid
  │   • Classroom is active
  │   • Not already enrolled
  │
  ├─► Show classroom preview:
  │   • Name: "Cybersecurity 101"
  │   • Teacher: "Prof. Smith"
  │   • Description: "..."
  │
  ├─► Click "Join Classroom"
  │
  ├─► Enrollment successful!
  │
  └─► Student sees:
      • Classroom in dashboard
      • Assigned resources
      • Due dates
END
```

### Flow 2: Join Classroom via Manual Code

```
START
  │
  ├─► Login as Student
  │
  ├─► Navigate to "Join Classroom"
  │
  ├─► Select "Enter Code"
  │
  ├─► Type classroom code:
  │   [A][B][C][1][2][3][4][5]
  │
  ├─► Click "Verify Code"
  │
  ├─► System checks code validity
  │
  ├─► If valid:
  │   │
  │   ├─► Show classroom preview:
  │   │   • Name
  │   │   • Teacher
  │   │   • Description
  │   │
  │   ├─► Click "Join"
  │   │
  │   └─► Enrolled successfully!
  │
  └─► If invalid:
      │
      └─► Show error:
          "Invalid classroom code. Please check and try again."
END
```

### Flow 3: View Assigned Resources

```
START (Student enrolled in classroom)
  │
  ├─► Navigate to "My Classrooms"
  │
  ├─► Select classroom
  │
  ├─► View tabs:
  │   │
  │   ├─► Quizzes Tab:
  │   │   • List of assigned quizzes
  │   │   • Due dates
  │   │   • Completion status
  │   │   • Scores (if completed)
  │   │
  │   ├─► Simulations Tab:
  │   │   • List of assigned simulations
  │   │   • Due dates
  │   │   • Completion status
  │   │   • Progress
  │   │
  │   └─► Modules Tab:
  │       • List of assigned modules
  │       • Due dates
  │       • Completion status
  │       • Progress percentage
  │
  ├─► Click on any resource to:
  │   • View details
  │   • Start/Continue
  │   • View results
  │
  └─► Resources sorted by:
      • Due date (upcoming first)
      • Status (incomplete first)
      • Assignment date
END
```

### Flow 4: Complete an Assigned Quiz

```
START (Quiz assigned to classroom)
  │
  ├─► Student sees quiz in dashboard
  │   • "Phishing Awareness Quiz"
  │   • Due: May 15, 2026
  │   • Status: Not started
  │
  ├─► Click "Start Quiz"
  │
  ├─► Answer questions:
  │   • Question 1 of 10
  │   • Multiple choice
  │   • Progress bar
  │
  ├─► Submit answers
  │
  ├─► View results:
  │   • Score: 8/10 (80%)
  │   • Correct answers
  │   • Explanations
  │
  ├─► Quiz marked as completed
  │
  ├─► Teacher sees:
  │   • Student completed quiz
  │   • Score
  │   • Completion time
  │
  └─► Student earns:
      • XP points
      • Badges (if applicable)
      • Certificate (if applicable)
END
```

### Flow 5: Leave a Classroom

```
START
  │
  ├─► Navigate to classroom
  │
  ├─► Click "Leave Classroom"
  │
  ├─► Confirm action:
  │   "Are you sure you want to leave this classroom?"
  │   "You will lose access to all assigned resources."
  │   [Cancel] [Leave]
  │
  ├─► Student removed from classroom
  │
  ├─► Loses access to:
  │   • Classroom dashboard
  │   • Assigned quizzes
  │   • Assigned simulations
  │   • Assigned modules
  │
  └─► Can rejoin later if:
      • Has classroom code
      • Classroom is active
      • Teacher hasn't blocked
END
```

---

## ⚙️ System Flows

### Flow 1: QR Code Generation Process

```
START (Classroom created)
  │
  ├─► System generates unique code:
  │   • Random 8 characters
  │   • Uppercase letters and numbers
  │   • Check for uniqueness
  │   • Example: "ABC12345"
  │
  ├─► Build join URL:
  │   • Base: FRONTEND_URL from .env
  │   • Path: /join-classroom/
  │   • Code: ABC12345
  │   • Result: "http://localhost:3000/join-classroom/ABC12345"
  │
  ├─► Generate QR code:
  │   • Use SimpleSoftwareIO/QrCode
  │   • Format: PNG
  │   • Size: 300x300 pixels
  │   • Encode: Join URL
  │
  ├─► Save QR code:
  │   • Path: storage/app/public/qr-codes/
  │   • Filename: classroom-{id}-{code}.png
  │   • Example: classroom-1-ABC12345.png
  │
  ├─► Update database:
  │   • Save QR code path
  │   • Link to classroom
  │
  └─► Return to teacher:
      • QR code URL
      • Classroom code
      • Join URL
END
```

### Flow 2: Student Join Verification

```
START (Student submits code)
  │
  ├─► Receive code: "ABC12345"
  │
  ├─► Validate format:
  │   • Length = 8 characters?
  │   • Alphanumeric only?
  │
  ├─► Query database:
  │   • Find classroom with code
  │
  ├─► Check classroom status:
  │   • Is active? (not archived)
  │
  ├─► Check enrollment:
  │   • Already enrolled?
  │   • Previously removed?
  │
  ├─► Decision tree:
  │   │
  │   ├─► If code invalid:
  │   │   └─► Return error: "Invalid code"
  │   │
  │   ├─► If classroom archived:
  │   │   └─► Return error: "Classroom not active"
  │   │
  │   ├─► If already enrolled (active):
  │   │   └─► Return: "Already enrolled"
  │   │
  │   ├─► If previously removed:
  │   │   ├─► Reactivate enrollment
  │   │   └─► Return: "Rejoined successfully"
  │   │
  │   └─► If all checks pass:
  │       ├─► Create enrollment record
  │       ├─► Set status: active
  │       ├─► Set joined_at: now
  │       └─► Return: "Joined successfully"
  │
END
```

### Flow 3: Resource Assignment Propagation

```
START (Teacher assigns quiz)
  │
  ├─► Teacher selects:
  │   • Classroom: "Cybersecurity 101"
  │   • Quiz: "Phishing Awareness"
  │   • Due date: May 15, 2026
  │
  ├─► System validates:
  │   • Teacher owns classroom?
  │   • Quiz exists?
  │   • Due date valid?
  │
  ├─► Create assignment record:
  │   • classroom_id: 1
  │   • quiz_id: 5
  │   • due_date: 2026-05-15 23:59:59
  │   • is_active: true
  │   • assigned_at: now
  │
  ├─► Save to database:
  │   • Table: classroom_quizzes
  │
  ├─► Assignment now visible to:
  │   │
  │   ├─► All enrolled students:
  │   │   • Query: classroom_students
  │   │   • Where: classroom_id = 1
  │   │   • And: status = 'active'
  │   │
  │   └─► Students see in dashboard:
  │       • New quiz available
  │       • Due date
  │       • Quiz details
  │
  ├─► Teacher can track:
  │   • Who viewed
  │   • Who started
  │   • Who completed
  │   • Scores
  │
END
```

### Flow 4: Authorization Check

```
START (API request received)
  │
  ├─► Extract JWT token from header
  │
  ├─► Verify token:
  │   • Valid signature?
  │   • Not expired?
  │   • Extract user ID
  │
  ├─► Load user from database
  │
  ├─► Check user role:
  │   • teacher, student, or admin?
  │
  ├─► Check route requirements:
  │   • /teacher/* requires teacher or admin
  │   • /student/* requires student, user, or admin
  │
  ├─► If accessing specific classroom:
  │   │
  │   ├─► For teachers:
  │   │   • Is user the classroom owner?
  │   │   • Or is user an admin?
  │   │
  │   └─► For students:
  │       • Is user enrolled?
  │       • Is enrollment active?
  │
  ├─► Decision:
  │   │
  │   ├─► If authorized:
  │   │   └─► Execute controller method
  │   │
  │   ├─► If unauthorized:
  │   │   └─► Return 403 Forbidden
  │   │
  │   └─► If unauthenticated:
  │       └─► Return 401 Unauthorized
  │
END
```

### Flow 5: Analytics Calculation

```
START (Teacher requests analytics)
  │
  ├─► Identify classroom: ID = 1
  │
  ├─► Query database for:
  │   │
  │   ├─► Student count:
  │   │   • Count classroom_students
  │   │   • Where status = 'active'
  │   │
  │   ├─► Assignment counts:
  │   │   • Count classroom_quizzes
  │   │   • Count classroom_simulations
  │   │   • Count classroom_modules
  │   │
  │   ├─► Per-student progress:
  │   │   • For each student:
  │   │     ├─► Quiz attempts
  │   │     ├─► Simulation runs
  │   │     ├─► Module progress
  │   │     └─► Last activity
  │   │
  │   └─► Per-assignment stats:
  │       • For each assignment:
  │         ├─► Total students
  │         ├─► Completed count
  │         ├─► Average score
  │         └─► Completion rate
  │
  ├─► Calculate aggregates:
  │   • Overall completion rate
  │   • Average scores
  │   • Engagement metrics
  │
  ├─► Format response:
  │   • JSON structure
  │   • Readable format
  │   • Charts data
  │
  └─► Return to teacher:
      • Dashboard data
      • Visualizations
      • Export options
END
```

---

## 🔄 Complete User Journey

### Teacher Journey

```
Day 1: Setup
  ├─► Create account (or login)
  ├─► Create classroom
  ├─► Download QR code
  └─► Share with students

Day 2: Assignment
  ├─► Students join classroom
  ├─► Assign first quiz
  ├─► Set due date
  └─► Monitor enrollment

Day 3-7: Monitoring
  ├─► Check student progress
  ├─► View completion rates
  ├─► Assign more resources
  └─► Send reminders

Day 8: Review
  ├─► View analytics
  ├─► Export reports
  ├─► Identify struggling students
  └─► Plan interventions
```

### Student Journey

```
Day 1: Join
  ├─► Receive QR code/code
  ├─► Scan or enter code
  ├─► Join classroom
  └─► View dashboard

Day 2: Explore
  ├─► See assigned quiz
  ├─► Check due date
  ├─► Review materials
  └─► Plan schedule

Day 3-7: Complete
  ├─► Start quiz
  ├─► Answer questions
  ├─► Submit answers
  └─► View results

Day 8: Continue
  ├─► Complete simulations
  ├─► Finish modules
  ├─► Earn badges
  └─► Track progress
```

---

## 📱 Mobile vs Desktop Flow

### Mobile (QR Scanning)
```
Student → Open app → Tap "Join" → Scan QR → Confirm → Joined
         (5 seconds)
```

### Desktop (Manual Entry)
```
Student → Open browser → Navigate to join → Enter code → Verify → Confirm → Joined
         (30 seconds)
```

---

## 🎯 Decision Points

### For Teachers

**When to create a new classroom?**
- New course/semester
- Different student group
- Different topic/module

**When to assign resources?**
- After covering topic in class
- As homework
- For assessment
- For practice

**When to remove a student?**
- Student dropped course
- Enrolled in wrong class
- Disciplinary reasons
- Student request

### For Students

**How to join?**
- QR code: Fast, convenient, mobile-friendly
- Manual code: Works anywhere, no camera needed
- URL: Direct link, one-click join

**When to leave?**
- Completed course
- Enrolled in wrong class
- No longer interested
- Switching sections

---

This visual guide helps understand the complete flow of the classroom system from both teacher and student perspectives.
