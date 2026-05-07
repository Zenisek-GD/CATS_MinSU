# 📸 Teacher UI Visual Guide

## What Teachers Will See

### 1. Teacher Dashboard (`/teacher/dashboard`)

```
┌─────────────────────────────────────────────────────────────┐
│  My Classrooms                        [+ Create Classroom]  │
│  Manage your classes, students, and assignments             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ 📚       │  │ 👥       │  │ 📦       │                 │
│  │ Active   │  │ Total    │  │ Archived │                 │
│  │ Classes  │  │ Students │  │          │                 │
│  │    3     │  │    45    │  │    1     │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                              │
│  Active Classrooms                                          │
│  ┌────────────────────┐  ┌────────────────────┐           │
│  │ Cybersecurity 101  │  │ Phishing Awareness │           │
│  │ ABC12345          │  │ XYZ98765          │           │
│  │                    │  │                    │           │
│  │ Introduction to... │  │ Learn to identify...│           │
│  │                    │  │                    │           │
│  │ 👥 15 students    │  │ 👥 20 students    │           │
│  │                    │  │                    │           │
│  │ [👁 View Details] │  │ [👁 View Details] │           │
│  └────────────────────┘  └────────────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Classroom Detail Page (`/teacher/classrooms/:id`)

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back to Dashboard]                                       │
├─────────────────────────────────────────────────────────────┤
│  Cybersecurity 101                                          │
│  Introduction to cybersecurity awareness                     │
│                                                              │
│  [✏ Edit] [📱 QR Code] [📋 Copy Code] [📦 Archive]        │
│                                                              │
│  Classroom Code: ABC12345                                   │
├─────────────────────────────────────────────────────────────┤
│  [👥 Students (15)] [📝 Quizzes (3)] [🎮 Simulations (2)] [📚 Modules (4)]
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Students Tab (Active):                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ John Doe                              [🗑 Remove]    │  │
│  │ john@example.com                                      │  │
│  │ Joined: May 1, 2026                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Jane Smith                            [🗑 Remove]    │  │
│  │ jane@example.com                                      │  │
│  │ Joined: May 2, 2026                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Quizzes Tab

```
┌─────────────────────────────────────────────────────────────┐
│  Assigned Quizzes                      [+ Assign Quiz]      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Phishing Awareness Quiz               [🗑 Remove]    │  │
│  │ Test your knowledge about phishing attacks            │  │
│  │ Due: May 15, 2026                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Password Security Quiz                [🗑 Remove]    │  │
│  │ Learn about strong passwords                          │  │
│  │ Due: May 20, 2026                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. Create Classroom Modal

```
┌─────────────────────────────────────────┐
│  Create New Classroom                   │
├─────────────────────────────────────────┤
│                                          │
│  Classroom Name *                       │
│  ┌────────────────────────────────────┐ │
│  │ Cybersecurity 101                  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Description                            │
│  ┌────────────────────────────────────┐ │
│  │ Introduction to cybersecurity      │ │
│  │ awareness                          │ │
│  └────────────────────────────────────┘ │
│                                          │
│         [Cancel] [Create Classroom]     │
│                                          │
└─────────────────────────────────────────┘
```

### 5. QR Code Modal

```
┌─────────────────────────────────────────┐
│  Classroom QR Code                      │
├─────────────────────────────────────────┤
│                                          │
│         ┌─────────────────┐             │
│         │                 │             │
│         │   QR CODE       │             │
│         │   IMAGE         │             │
│         │                 │             │
│         └─────────────────┘             │
│                                          │
│  Classroom Code:                        │
│  ABC12345                               │
│                                          │
│  Join URL:                              │
│  ┌────────────────────────────────────┐ │
│  │ http://localhost:3000/join/ABC...  │ │
│  └────────────────────────────────────┘ │
│                                          │
│  [📋 Copy URL] [⬇ Download QR] [Close] │
│                                          │
└─────────────────────────────────────────┘
```

### 6. Assign Resource Modal

```
┌─────────────────────────────────────────┐
│  Assign Quiz                            │
├─────────────────────────────────────────┤
│                                          │
│  Select Quiz                            │
│  ┌────────────────────────────────────┐ │
│  │ -- Select --                    ▼  │ │
│  └────────────────────────────────────┘ │
│  Options:                               │
│  - Phishing Awareness Quiz              │
│  - Password Security Quiz               │
│  - Social Engineering Quiz              │
│                                          │
│  Due Date (Optional)                    │
│  ┌────────────────────────────────────┐ │
│  │ 2026-05-15 23:59                   │ │
│  └────────────────────────────────────┘ │
│                                          │
│              [Cancel] [Assign]          │
│                                          │
└─────────────────────────────────────────┘
```

## Color Scheme

```
Primary Actions:    #007bff (Blue)
Success/Add:        #28a745 (Green)
Danger/Remove:      #dc3545 (Red)
Background:         #f8f9fa (Light Gray)
Cards:              #ffffff (White)
Text:               #1a1a1a (Dark)
Muted Text:         #666666 (Gray)
Borders:            #e0e0e0 (Light Gray)
```

## Icons Used

- 📚 Book - Classrooms/Modules
- 👥 Users - Students
- 📦 Archive - Archived items
- 📱 QR Code - QR code generation
- 📋 Copy - Copy to clipboard
- ✏ Edit - Edit mode
- 🗑 Trash - Remove/Delete
- 👁 Eye - View details
- ➕ Plus - Add/Create
- ⬇ Download - Download files
- 📝 Quizzes - Quiz assignments
- 🎮 Simulations - Simulation assignments
- ← Arrow - Back navigation

## Responsive Behavior

### Desktop (1400px+)
- 3-column grid for stats
- 2-column grid for classroom cards
- Side-by-side layouts
- Full-width modals (max 500px)

### Tablet (768px - 1399px)
- 2-column grid for stats
- 2-column grid for classroom cards
- Adjusted spacing
- Responsive modals

### Mobile (< 768px)
- Single column layouts
- Stacked cards
- Full-width buttons
- Scrollable tabs
- Touch-optimized spacing

## User Interactions

### Hover Effects
- Cards lift up slightly
- Buttons change color
- Cursor changes to pointer
- Subtle shadows appear

### Click Actions
- Buttons show pressed state
- Modals fade in/out
- Smooth transitions
- Loading indicators

### Feedback
- Success messages (green)
- Error messages (red)
- Confirmation dialogs
- Toast notifications

## Empty States

### No Classrooms
```
┌─────────────────────────────────────────┐
│                                          │
│              📚                          │
│                                          │
│      No active classrooms yet           │
│                                          │
│      [Create Your First Classroom]      │
│                                          │
└─────────────────────────────────────────┘
```

### No Students
```
┌─────────────────────────────────────────┐
│                                          │
│              👥                          │
│                                          │
│      No students enrolled yet           │
│                                          │
│  Share the classroom code or QR code    │
│  with students to let them join         │
│                                          │
└─────────────────────────────────────────┘
```

### No Resources
```
┌─────────────────────────────────────────┐
│                                          │
│      No quizzes assigned yet            │
│                                          │
│      [Assign Your First Quiz]           │
│                                          │
└─────────────────────────────────────────┘
```

## Navigation Flow

```
Login (teacher@example.com)
    ↓
Teacher Dashboard
    ↓
    ├─→ Click "Create Classroom"
    │       ↓
    │   Fill form → Create
    │       ↓
    │   Back to Dashboard (new classroom appears)
    │
    └─→ Click "View Details" on classroom
            ↓
        Classroom Detail Page
            ↓
            ├─→ Click "QR Code"
            │       ↓
            │   View/Download QR
            │       ↓
            │   Close modal
            │
            ├─→ Click "Students" tab
            │       ↓
            │   View student list
            │       ↓
            │   Click "Remove" on student
            │       ↓
            │   Confirm → Student removed
            │
            ├─→ Click "Quizzes" tab
            │       ↓
            │   Click "Assign Quiz"
            │       ↓
            │   Select quiz + due date
            │       ↓
            │   Click "Assign"
            │       ↓
            │   Quiz appears in list
            │
            └─→ Click "Back to Dashboard"
                    ↓
                Return to dashboard
```

## Key Features Visualization

### 1. Classroom Code Display
```
┌────────────────────────────────┐
│ Classroom Code: ABC12345       │
└────────────────────────────────┘
```

### 2. Student Count Badge
```
┌────────────────┐
│ 👥 15 students │
└────────────────┘
```

### 3. Due Date Badge
```
┌──────────────────────┐
│ Due: May 15, 2026    │
└──────────────────────┘
```

### 4. Status Indicator
```
Active:   ● Green
Archived: ● Gray
```

---

**This visual guide shows exactly what teachers will see and interact with in the UI!** 🎨
