# Agent Prompts - Quick Reference

## 📄 Main File
**Location**: `/Users/pranav/.gemini/antigravity/brain/5f0ffcf7-c38d-4865-b26f-c26f7f91b3e9/dashboard_enhancement_agents.md`

This file contains all 4 agent prompts with complete instructions.

---

## 🎯 Agent Overview

### Agent 1: Advanced Metrics Visualization
- **Goal**: Add charts, ratios (CAC:LTV), multiple view modes
- **Time**: 8-12 hours
- **Backend**: Adds `/api/metrics/ratios` and `/api/metrics/{metric}/history` endpoints

### Agent 2: Dashboard UI Cleanup
- **Goal**: Remove permissions display, create compact header
- **Time**: 2-3 hours
- **Backend**: No changes needed

### Agent 3: Real-Time Chat System
- **Goal**: iPhone-style chat popup from bottom-right
- **Time**: 15-20 hours
- **Backend**: Adds WebSocket `/ws/chat/{user_id}` and chat REST endpoints

### Agent 4: Admin Settings & User Management
- **Goal**: Full admin panel for CEO to manage users/permissions
- **Time**: 10-15 hours
- **Backend**: Adds `/api/admin/*` endpoints for user CRUD and permissions

---

## 🔧 Backend Information

### Location
```
/Users/pranav/MY_PROJECTS/TRART_PROJECTS/Whatsapp_chatbot_BusinessSetupCompany/TRART/0004_Dashboard_Backend/
```

### Main File
```
main.py
```

### Running
- **URL**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Auto-reload**: Yes (changes apply automatically)

### Current Endpoints
```
Authentication:
- POST /api/auth/login
- POST /api/auth/refresh
- GET  /api/auth/me

Metrics:
- GET  /api/metrics/mrr
- GET  /api/metrics/cac
- GET  /api/metrics/ltv
- GET  /api/metrics/qvc
- GET  /api/metrics/ltgp

Alfred AI:
- POST /api/alfred/chat

KPIs:
- GET  /api/kpis/daily
- GET  /api/kpis/weekly
- GET  /api/kpis/monthly

Permissions:
- GET  /api/permissions/me
```

### Adding New Endpoints
1. Open `main.py`
2. Add your function with `@app.get()` or `@app.post()` decorator
3. Save (server auto-reloads)
4. Test at http://localhost:8000/docs

---

## 📋 Execution Order (Recommended)

1. **Agent 2** - UI Cleanup (quick win, 2-3 hours)
2. **Agent 1** - Metrics Visualization (impressive, 8-12 hours)
3. **Agent 4** - Admin Settings (critical, 10-15 hours)
4. **Agent 3** - Chat System (complex, 15-20 hours)

---

## ⚠️ Critical Rules (All Agents)

### DO NOT BREAK:
- ✅ Login/logout functionality
- ✅ Current metric cards
- ✅ Permission system
- ✅ Alfred AI (Cmd+K)
- ✅ Dashboard routing

### MUST DO:
- ✅ Test after each change
- ✅ Add features, don't replace
- ✅ Graceful error handling
- ✅ Maintain responsive design

---

## 🚀 Ready to Start?

**Next Step**: Execute Agent 2 (UI Cleanup)

**Prompt Location**: 
`/Users/pranav/.gemini/antigravity/brain/5f0ffcf7-c38d-4865-b26f-c26f7f91b3e9/dashboard_enhancement_agents.md`

**Section**: "Agent 2: Dashboard UI Cleanup Specialist"

**What it does**:
- Removes permissions display from dashboard
- Creates compact header
- Frees up space for better metrics

**Estimated time**: 2-3 hours
