# Backend Setup Guide - Synops Labs Dashboard

## Overview

This guide will help you set up the FastAPI backend that powers the Synops Labs Dashboard. The backend handles authentication, metrics calculation, KPI tracking, and Alfred AI integration.

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ Python 3.9+ installed
- ✅ PostgreSQL installed and running
- ✅ Google Cloud account (for Sheets API)
- ✅ OpenAI API key
- ✅ Google Sheets spreadsheet ID and credentials

---

## 🚀 Quick Start

### Step 1: Create Backend Directory

```bash
cd /Users/pranav/MY_PROJECTS/TRART_PROJECTS/Whatsapp_chatbot_BusinessSetupCompany/TRART
mkdir 0004_Dashboard_Backend
cd 0004_Dashboard_Backend
```

### Step 2: Set Up Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Mac/Linux
# OR
venv\Scripts\activate  # On Windows
```

### Step 3: Install Dependencies

Create `requirements.txt`:

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
pydantic==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
google-auth==2.27.0
google-auth-oauthlib==1.2.0
google-auth-httplib2==0.2.0
google-api-python-client==2.116.0
openai==1.10.0
python-dotenv==1.0.0
alembic==1.13.1
```

Install:

```bash
pip install -r requirements.txt
```

### Step 4: Copy Backend Files

```bash
# Copy all backend files from NEW_DASHBOARD_FEATURES
cp -r ../0004_Dashboard/NEW_DASHBOARD_FEATURES/backend_files/* .
```

This will copy:
- `alfred_service.py`
- `metrics_calculator.py`
- `metrics_service.py`
- `metrics_sync.py`
- `permission_service.py`
- `sheets_service.py`
- `models/` (database models)
- `routers/` (API endpoints)
- `schemas/` (Pydantic schemas)
- `*.sql` (database migrations)

### Step 5: Create Main Application File

Create `main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, metrics, alfred, kpis
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Synops Labs API",
    description="Backend API for Synops Labs Dashboard",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(alfred.router, prefix="/api/alfred", tags=["Alfred AI"])
app.include_router(kpis.router, prefix="/api/kpis", tags=["KPIs"])

@app.get("/")
def read_root():
    return {"message": "Synops Labs API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
```

### Step 6: Set Up PostgreSQL Database

```bash
# Create database
psql -U postgres

# In PostgreSQL shell:
CREATE DATABASE synops_labs;
CREATE USER synops_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE synops_labs TO synops_user;
\q
```

### Step 7: Run Database Migrations

```bash
# Run SQL migration files
psql -U synops_user -d synops_labs -f metrics_schema.sql
psql -U synops_user -d synops_labs -f setup_permissions.sql
psql -U synops_user -d synops_labs -f create_users.sql
```

### Step 8: Configure Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://synops_user:your_password@localhost:5432/synops_labs

# Google Sheets
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/credentials.json

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
FRONTEND_URL=http://localhost:3000
```

### Step 9: Start the Backend Server

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Start server
uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 10: Verify Backend is Running

Open browser and visit:
- http://localhost:8000 - Should show: `{"message": "Synops Labs API is running"}`
- http://localhost:8000/docs - FastAPI interactive docs (Swagger UI)
- http://localhost:8000/health - Should show: `{"status": "healthy"}`

---

## 🔧 Google Sheets Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Synops Labs Metrics"
3. Enable Google Sheets API

### 2. Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: "synops-labs-sheets"
4. Grant role: "Editor"
5. Click "Create Key" → JSON
6. Download the JSON file

### 3. Set Up Spreadsheet

1. Create new Google Sheet
2. Name it: "Synops Labs Metrics"
3. Create 4 sheets (tabs):

**Sheet 1: Customers**
```
| Customer Name | Setup Fee | MRR | Start Date | Industry | Status | Plan Duration | Notes |
|---------------|-----------|-----|------------|----------|--------|---------------|-------|
```

**Sheet 2: Expenses**
```
| Date | Category | Amount | Description | Added By |
|------|----------|--------|-------------|----------|
```

**Sheet 3: Projects**
```
| Client Name | Project Name | Completion Date | Documentation Link | Value Type | Value Amount | Calculated By | Notes |
|-------------|--------------|-----------------|-------------------|------------|--------------|---------------|-------|
```

**Sheet 4: Strategic**
```
| Metric Name | Value | Notes | Last Updated |
|-------------|-------|-------|--------------|
```

4. Share spreadsheet with service account email (from JSON file)
   - Click "Share"
   - Paste service account email
   - Give "Editor" access

5. Copy spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### 4. Update Backend .env

```env
GOOGLE_SHEETS_ID=your_spreadsheet_id_from_url
GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/downloaded/credentials.json
```

---

## 🧪 Testing the Backend

### Test Authentication

```bash
# Register new user (CEO)
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pranav@synopslabs.com",
    "password": "SecurePassword123!",
    "name": "Pranav",
    "role": "ceo"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pranav@synopslabs.com",
    "password": "SecurePassword123!"
  }'
```

### Test Metrics Endpoint

```bash
# Get MRR (requires auth token)
curl -X GET http://localhost:8000/api/metrics/mrr \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Alfred AI

```bash
# Chat with Alfred
curl -X POST http://localhost:8000/api/alfred/chat \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is our current MRR?"
  }'
```

---

## 🔗 Connect Frontend to Backend

### Update Frontend .env.local

Update `/Users/pranav/MY_PROJECTS/TRART_PROJECTS/Whatsapp_chatbot_BusinessSetupCompany/TRART/0004_Dashboard/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google Sheets Integration
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=your-private-key-from-json
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# OpenAI API
OPENAI_API_KEY=sk-your-openai-api-key

# Authentication Secrets
JWT_SECRET=same-as-backend-jwt-secret
JWT_REFRESH_SECRET=same-as-backend-refresh-secret
```

### Restart Frontend

```bash
cd /Users/pranav/MY_PROJECTS/TRART_PROJECTS/Whatsapp_chatbot_BusinessSetupCompany/TRART/0004_Dashboard
npm run dev
```

---

## ✅ Verification Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] PostgreSQL database created and migrations run
- [ ] Google Sheets spreadsheet created and shared
- [ ] Service account credentials downloaded
- [ ] Environment variables configured (both frontend and backend)
- [ ] Can login to dashboard
- [ ] Metrics load from Google Sheets
- [ ] Alfred AI responds to messages
- [ ] KPIs display correctly

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Make sure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

**Error:** `Could not connect to database`
```bash
# Check PostgreSQL is running
brew services list  # Mac
sudo systemctl status postgresql  # Linux

# Verify database exists
psql -U postgres -l
```

### Google Sheets errors

**Error:** `google.auth.exceptions.DefaultCredentialsError`
```bash
# Check credentials path is correct
ls -la /path/to/credentials.json

# Update .env with correct path
GOOGLE_SHEETS_CREDENTIALS_PATH=/absolute/path/to/credentials.json
```

**Error:** `The caller does not have permission`
```bash
# Make sure spreadsheet is shared with service account email
# Check service account email in credentials.json: "client_email"
```

### Frontend can't connect to backend

**Error:** `Network Error` or `CORS error`
```python
# In main.py, verify CORS settings:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Must match frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Authentication errors

**Error:** `Invalid credentials`
```bash
# Check JWT secrets match in both .env files
# Frontend .env.local and Backend .env must have same JWT_SECRET
```

---

## 📁 Final Backend Structure

```
0004_Dashboard_Backend/
├── venv/                      # Virtual environment
├── main.py                    # FastAPI application
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
├── models/                    # Database models
│   ├── user.py
│   ├── permission.py
│   ├── business_metric.py
│   └── alfred_session.py
├── routers/                   # API endpoints
│   ├── auth.py
│   ├── metrics.py
│   ├── alfred.py
│   └── kpis.py
├── schemas/                   # Pydantic schemas
│   ├── auth.py
│   ├── metrics.py
│   └── alfred.py
├── services/                  # Business logic
│   ├── alfred_service.py
│   ├── metrics_calculator.py
│   ├── metrics_service.py
│   ├── permission_service.py
│   └── sheets_service.py
└── *.sql                      # Database migrations
```

---

## 🚀 Next Steps

1. **Start Backend:**
   ```bash
   cd 0004_Dashboard_Backend
   source venv/bin/activate
   uvicorn main:app --reload --port 8000
   ```

2. **Start Frontend:**
   ```bash
   cd ../0004_Dashboard
   npm run dev
   ```

3. **Test Login:**
   - Go to http://localhost:3000/login
   - Login with CEO credentials
   - Verify metrics load

4. **Test Alfred:**
   - Press Cmd+K (or Ctrl+K)
   - Ask: "What is our current MRR?"
   - Verify response

5. **Add Sample Data:**
   - Open Google Sheets
   - Add sample customers, expenses, projects
   - Refresh dashboard to see updated metrics

---

## 🎉 Success!

Once everything is running, you should see:
- ✅ Dashboard loads at http://localhost:3000
- ✅ Login works
- ✅ All 5 metrics display real data from Google Sheets
- ✅ Alfred AI responds to queries (Cmd+K)
- ✅ KPIs show data
- ✅ Permission system works (test with different user roles)

Your Synops Labs Dashboard is now **fully operational**! 🚀
