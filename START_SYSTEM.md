# 🚀 CATS System - Start Guide

## ─────────────────────────────────────
## OPTION A: Local Only (Same Computer)
## ─────────────────────────────────────

### Step 1 — Start Backend
```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend
php artisan serve --port=9000
```
Leave this terminal open.

### Step 2 — Start Frontend (new terminal)
```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend
npm run dev
```
Leave this terminal open.

### Step 3 — Open in browser
```
http://localhost:5173
```

---

## ─────────────────────────────────────────────────────
## OPTION B: Share with Another Device (Different Location)
## ─────────────────────────────────────────────────────

### Step 1 — Start Backend
```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend
php artisan serve --port=9000
```
Leave this terminal open.

### Step 2 — Build Frontend
```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend
npm run build
```

### Step 3 — Copy Frontend Build into Backend
```powershell
Copy-Item -Path "C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend\dist\*" -Destination "C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend\public\dist\" -Recurse -Force
```

### Step 4 — Start ngrok Tunnel (new terminal)
```powershell
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
ngrok start --all --config="C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend\ngrok.yml"
```

### Step 5 — Copy the ngrok URL shown
You will see something like:
```
Forwarding  https://lake-enactment-kitty.ngrok-free.dev -> http://localhost:9000
```
Copy that `https://xxxx.ngrok-free.dev` URL.

### Step 6 — Update Frontend .env with ngrok URL
Open `cats_frontend/.env` and update:
```env
VITE_API_BASE_URL=https://xxxx.ngrok-free.dev/api
VITE_BACKEND_URL=https://xxxx.ngrok-free.dev
```

### Step 7 — Update Backend .env with ngrok URL
Open `cats_backend/.env` and update:
```env
APP_URL=https://xxxx.ngrok-free.dev
FRONTEND_URL=https://xxxx.ngrok-free.dev
```

### Step 8 — Rebuild Frontend with new URL
```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend
npm run build
Copy-Item -Path "dist\*" -Destination "..\cats_backend\public\dist\" -Recurse -Force
```

### Step 9 — Clear Laravel Config Cache
```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend
php artisan config:clear
```

### Step 10 — Share the URL
Send this to the other device:
```
https://xxxx.ngrok-free.dev
```
They open it in any browser — done!

---

## ─────────────────────────────────────────────────────
## OPTION C: Share on Same WiFi Network
## ─────────────────────────────────────────────────────

### Step 1 — Find your local IP
```powershell
ipconfig | findstr "IPv4"
# Example result: 192.168.1.5
```

### Step 2 — Update Frontend .env
```env
VITE_API_BASE_URL=http://192.168.1.5:9000/api
VITE_BACKEND_URL=http://192.168.1.5:9000
```

### Step 3 — Start Backend on all interfaces
```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_backend
php artisan serve --host=0.0.0.0 --port=9000
```

### Step 4 — Start Frontend on all interfaces
```powershell
cd C:\Users\Gerald\Desktop\SysAdmin\CATS_MinSU\cats_frontend
npm run dev --host
```

### Step 5 — Other device opens
```
http://192.168.1.5:5173
```

---

## ─────────────────────────────────────
## TEST ACCOUNTS
## ─────────────────────────────────────

| Role    | Email                    | Password |
|---------|--------------------------|----------|
| Admin   | admin@example.com        | password |
| Teacher | teacher@example.com      | password |
| Student | student1@example.com     | password |
| Student | student2@example.com     | password |
| Student | student3@example.com     | password |

---

## ─────────────────────────────────────
## TROUBLESHOOTING
## ─────────────────────────────────────

### 403 Forbidden on API calls
```powershell
# Check user role in database
cd cats_backend
php artisan tinker
DB::table('users')->select('id','email','role')->get();
exit
```

### Database tables missing
```powershell
cd cats_backend
php artisan migrate
php artisan db:seed --class=ClassroomSeeder
```

### ngrok URL changed (it changes every restart on free plan)
Repeat Steps 6, 7, 8, 9 from Option B with the new URL.

### Config not updating
```powershell
cd cats_backend
php artisan config:clear
php artisan cache:clear
```

### Frontend changes not showing on other device
```powershell
cd cats_frontend
npm run build
Copy-Item -Path "dist\*" -Destination "..\cats_backend\public\dist\" -Recurse -Force
```

---

## ─────────────────────────────────────
## QUICK REFERENCE - PORTS
## ─────────────────────────────────────

| Service  | Port | URL                    |
|----------|------|------------------------|
| Backend  | 9000 | http://localhost:9000  |
| Frontend | 5173 | http://localhost:5173  |
| ngrok UI | 4040 | http://localhost:4040  |

---

## ─────────────────────────────────────
## CURRENT NGROK CONFIG
## ─────────────────────────────────────

Config file: `cats_frontend/ngrok.yml`
```yaml
version: "2"
authtoken: 3DGkFR4EBBCifQx8d6PfzmQn9ot_4hFKpya1Kr7W2axby4Dw9
tunnels:
  backend:
    proto: http
    addr: 9000
```

> ⚠️ ngrok free plan gives a NEW URL every time you restart.
> Always update .env files with the new URL after restarting ngrok.

---

## ─────────────────────────────────────
## FILE LOCATIONS
## ─────────────────────────────────────

```
CATS_MinSU/
├── cats_backend/          ← Laravel API
│   ├── .env               ← APP_URL, DB settings
│   └── public/dist/       ← Built frontend files (for sharing)
│
├── cats_frontend/         ← React app
│   ├── .env               ← VITE_API_BASE_URL
│   ├── ngrok.yml          ← ngrok tunnel config
│   └── dist/              ← Built files (run npm run build)
│
└── START_SYSTEM.md        ← This file
```
