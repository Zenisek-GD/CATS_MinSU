# 🎓 Teacher Feature - Quick Reference Card

## 🚀 Getting Started (30 seconds)

1. **Login**: `teacher@example.com` / `password`
2. **Create Classroom**: Click "Create Classroom" button
3. **Share Code**: Click "QR Code" or "Copy Code"
4. **Assign Resources**: Go to classroom → Click tab → Click "Assign"

## 📍 URLs

- **Teacher Dashboard**: `http://localhost:5173/teacher/dashboard`
- **Classroom Details**: `http://localhost:5173/teacher/classrooms/:id`

## 🎯 Main Features

| Feature | How To |
|---------|--------|
| **Create Classroom** | Dashboard → "Create Classroom" → Fill form → Create |
| **Get QR Code** | Classroom → "QR Code" → Download/Share |
| **Copy Code** | Classroom → "Copy Code" button |
| **Add Student** | Share QR/Code → Student scans/enters |
| **Remove Student** | Classroom → Students tab → "Remove" |
| **Assign Quiz** | Classroom → Quizzes tab → "Assign Quiz" |
| **Assign Simulation** | Classroom → Simulations tab → "Assign Simulation" |
| **Assign Module** | Classroom → Modules tab → "Assign Module" |
| **Edit Classroom** | Classroom → "Edit" → Modify → "Save" |
| **Archive Classroom** | Classroom → "Archive" → Confirm |

## 🎨 UI Components

### Dashboard
```
Stats Cards → Classroom Cards → Create Button
```

### Classroom Detail
```
Header (Actions) → Tabs → Content → Modals
```

### Tabs
- **Students**: View and manage enrolled students
- **Quizzes**: Assign and manage quiz assignments
- **Simulations**: Assign and manage simulation assignments
- **Modules**: Assign and manage module assignments

## 📱 Buttons & Actions

| Button | Action |
|--------|--------|
| `+ Create Classroom` | Opens create modal |
| `👁 View Details` | Goes to classroom detail |
| `📱 QR Code` | Shows QR code modal |
| `📋 Copy Code` | Copies code to clipboard |
| `✏ Edit` | Enables edit mode |
| `💾 Save` | Saves changes |
| `❌ Cancel` | Cancels edit |
| `📦 Archive` | Archives classroom |
| `🗑 Remove` | Removes student/resource |
| `➕ Assign` | Opens assign modal |

## 🔄 Common Workflows

### Create & Share Classroom
```
1. Click "Create Classroom"
2. Enter name & description
3. Click "Create"
4. Click "QR Code"
5. Download or share on screen
```

### Assign Quiz to Class
```
1. Go to classroom details
2. Click "Quizzes" tab
3. Click "Assign Quiz"
4. Select quiz from dropdown
5. Set due date (optional)
6. Click "Assign"
```

### Manage Students
```
1. Go to classroom details
2. Click "Students" tab
3. View list of students
4. Click "Remove" to remove student
5. Confirm action
```

## 🎨 Color Codes

- **Blue** (#007bff): Primary actions (View, Edit, QR)
- **Green** (#28a745): Add/Assign actions
- **Red** (#dc3545): Remove/Delete actions
- **Gray** (#f8f9fa): Secondary actions

## 📊 Stats Display

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Active   │  │ Total    │  │ Archived │
│ Classes  │  │ Students │  │          │
│    3     │  │    45    │  │    1     │
└──────────┘  └──────────┘  └──────────┘
```

## 🔑 Keyboard Shortcuts

- `Esc`: Close modal
- `Enter`: Submit form (when in input)
- `Tab`: Navigate form fields

## 💡 Pro Tips

1. **QR Codes**: Best for in-person classes
2. **Text Codes**: Best for remote/online
3. **Due Dates**: Optional but recommended
4. **Descriptions**: Help students understand class purpose
5. **Archive**: Don't delete, archive old classes

## ⚠️ Important Notes

- Classroom codes are **8 characters** (letters & numbers)
- Codes are **unique** and **case-insensitive**
- QR codes are **auto-generated** on creation
- Students can **rejoin** after being removed
- Archived classrooms can be **viewed** but not modified

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't see dashboard | Check you're logged in as teacher |
| QR code not showing | Click "QR Code" button in classroom |
| Student can't join | Verify code is correct & classroom is active |
| Can't assign resource | Check resource exists in system |
| Changes not saving | Check internet connection |

## 📞 Quick Help

### Can't create classroom?
- Check you're logged in as teacher/admin
- Verify name field is filled
- Check browser console for errors

### Students not appearing?
- Refresh the page
- Check Students tab
- Verify students joined with correct code

### Resources not showing?
- Check correct tab (Quizzes/Simulations/Modules)
- Verify resource was assigned
- Refresh the page

## 🎯 Success Checklist

- [ ] Logged in as teacher
- [ ] Created first classroom
- [ ] Generated QR code
- [ ] Shared code with students
- [ ] Students joined classroom
- [ ] Assigned first quiz
- [ ] Assigned first simulation
- [ ] Assigned first module
- [ ] Viewed student list
- [ ] Tested remove student

## 📚 Full Documentation

- **Implementation**: `TEACHER_UI_IMPLEMENTATION.md`
- **Visual Guide**: `TEACHER_UI_SCREENSHOTS_GUIDE.md`
- **Complete Guide**: `TEACHER_FEATURE_COMPLETE.md`
- **Backend API**: `cats_backend/CLASSROOM_API_EXAMPLES.md`

## 🎉 You're Ready!

**Login and start creating classrooms!** 🚀

```
URL: http://localhost:5173
Email: teacher@example.com
Password: password
```

---

**Need help?** Check the full documentation files listed above!
