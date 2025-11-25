# 🎯 COPY-PASTE AGENT PROMPTS

## How to Use This Document

Each section below is a **complete, standalone prompt** for a separate AI agent. Copy the entire section (from the header to the "---" separator) and paste it into a new agent conversation.

**Important**: Each prompt is self-contained with:
- ✅ Full context about the project
- ✅ Backward compatibility rules
- ✅ Backend access information
- ✅ Detailed requirements
- ✅ Technical implementation guide
- ✅ Success criteria

---

## 📋 Project Context (Include with ALL agents)

**Project**: Synops Labs Dashboard  
**Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS  
**Backend**: FastAPI (Python)  
**Theme**: Black + Cyan, Apple-inspired design

**Frontend Location**: `/Users/pranav/MY_PROJECTS/TRART_PROJECTS/Whatsapp_chatbot_BusinessSetupCompany/TRART/0004_Dashboard/`

**Backend Locations** (both have same code):
- **Primary (Running)**: `/Users/pranav/MY_PROJECTS/TRART_PROJECTS/Whatsapp_chatbot_BusinessSetupCompany/TRART/0004_Dashboard_Backend/main.py`
- **Mirror**: `/Users/pranav/MY_PROJECTS/TRART_PROJECTS/Whatsapp_chatbot_BusinessSetupCompany/TRART/0004_Dashboard/backend/main.py`

**Backend Running**: http://localhost:8000 (auto-reload enabled)  
**Frontend Running**: http://localhost:3000

**Current Users** (in MOCK_USERS):
- pranav@synopslabs.com (CEO)
- fazil@synopslabs.com (Co-Founder)
- suhail@synopslabs.com (Sales Agent)

---

## ⚠️ CRITICAL RULES (ALL AGENTS MUST FOLLOW)

### DO NOT BREAK:
1. ✅ Authentication system (login/logout)
2. ✅ Current metric cards (MRR, CAC, LTV, QVC, LTGP)
3. ✅ Permission system
4. ✅ Alfred AI (Cmd+K)
5. ✅ Dashboard routing

### MUST DO:
1. ✅ **ADDITIVE CHANGES ONLY** - Add features, don't replace working ones
2. ✅ **TEST AFTER EACH CHANGE** - Verify login, metrics, permissions still work
3. ✅ **GRACEFUL ERROR HANDLING** - Show loading states, not errors
4. ✅ **MAINTAIN RESPONSIVE DESIGN** - Desktop, tablet, mobile

---

## 🎨 AGENT 1: Advanced Metrics Visualization

**Estimated Time**: 8-12 hours

### Your Mission
Transform basic metric cards into a sophisticated analytics dashboard with multiple view modes, interactive charts, and business ratio analysis.

### What Currently Exists
- 5 metric cards: MRR, CAC, LTV, QVC, LTGP
- Each shows: value, trend %, sparkline
- Backend endpoints: `/api/metrics/{mrr|cac|ltv|qvc|ltgp}`

### What You Need to Build

#### 1. View Switcher (4 modes)
- **Card View** (default): Current metric cards
- **Chart View**: Full interactive charts with zoom
- **Comparison View**: Side-by-side metrics
- **Ratio View**: Business ratios with health indicators

#### 2. Key Ratios (MUST implement)
- **CAC:LTV Ratio**: Green if >3, Yellow if 2-3, Red if <2
- **MRR Growth Rate**: Month-over-month %
- **Acquisition Efficiency**: MRR/CAC
- **Burn Multiple**: Net burn / Net new ARR

#### 3. Additional Metrics (Your choice - suggest 3-5)
Research and implement metrics relevant to AI consultancy:
- Examples: Net Revenue Retention, Magic Number, Rule of 40
- Justify each metric's business value
- Implement with appropriate visualizations

#### 4. Chart Types
- **Line Charts**: Time-series (MRR over time)
- **Area Charts**: Cumulative (total revenue)
- **Pie/Donut**: Composition (revenue by client type)
- **Bar Charts**: Comparisons (monthly performance)
- **Gauge Charts**: Single KPI with target

#### 5. Apple Design Guidelines
- Fluid animations (300-400ms ease-in-out)
- Glassmorphism (backdrop blur, subtle glows)
- SF Pro Display/Text fonts
- 8px grid system
- Colors: Black (#000), Cyan (#00D9FF), Green (#34C759), Yellow (#FFD60A), Red (#FF453A)

### Technical Implementation

**Frontend Components to Create**:
```
components/dashboard/metrics/
├── metric-view-switcher.tsx
├── metric-chart-view.tsx
├── metric-ratio-view.tsx
├── metric-comparison-view.tsx
├── charts/
│   ├── line-chart.tsx
│   ├── area-chart.tsx
│   ├── pie-chart.tsx
│   ├── gauge-chart.tsx
│   └── chart-tooltip.tsx
└── ratios/
    ├── cac-ltv-ratio.tsx
    ├── growth-rate.tsx
    └── efficiency-score.tsx
```

**Backend Endpoints to Add** (in `main.py`):
```python
@app.get("/api/metrics/ratios")
async def get_metric_ratios():
    return {
        "cac_ltv_ratio": 3.2,
        "mrr_growth_rate": 7.14,
        "acquisition_efficiency": 36.0,
        "burn_multiple": 1.5
    }

@app.get("/api/metrics/{metric_name}/history")
async def get_metric_history(metric_name: str, days: int = 30):
    # Return time-series data for charts
    # Generate mock data for now
    pass
```

**Libraries** (already installed):
- Recharts (charts)
- Framer Motion (animations)
- date-fns (date formatting)

### Success Criteria
- [ ] Users can switch between 4 view modes
- [ ] CAC:LTV ratio shows color-coded health
- [ ] All charts are interactive (hover, zoom)
- [ ] Animations are fluid (60fps)
- [ ] Design matches Apple aesthetic
- [ ] Mobile responsive

### Testing Checklist
- [ ] Login still works
- [ ] Original metric cards still display
- [ ] Permission checks intact
- [ ] No console errors
- [ ] Responsive on mobile

---

## 🗑️ AGENT 2: Dashboard UI Cleanup

**Estimated Time**: 2-3 hours

### Your Mission
Remove the permissions display from the dashboard and create a clean, compact header to free up space for metrics.

### What Currently Exists
- Dashboard shows all 10 user permissions as badges
- Takes up significant vertical space
- Located in `app/page.tsx` lines 44-73

### What You Need to Do

#### 1. Remove Permissions Display
- Delete the "Your Permissions" section from main dashboard
- Keep welcome message but make it compact
- Permissions will only show in admin settings (future)

#### 2. Create Compact Header
Replace the large welcome card with:

```tsx
// New component: components/dashboard/layout/dashboard-header.tsx

export function DashboardHeader() {
  const { user, logout } = useAuth();
  
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {user?.name}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <Badge className="bg-cyan-500 text-black">
            {user?.role}
          </Badge>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">{user?.email}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-400">
          Press <kbd className="px-2 py-1 bg-gray-800 rounded">⌘K</kbd> for Alfred
        </div>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>
    </div>
  );
}
```

#### 3. Update app/page.tsx
- Import the new DashboardHeader
- Replace lines 44-73 with `<DashboardHeader />`
- Adjust spacing for better visual balance

### Files to Modify
1. Create: `components/dashboard/layout/dashboard-header.tsx`
2. Modify: `app/page.tsx` (remove permissions section)

### Success Criteria
- [ ] Dashboard feels cleaner
- [ ] User info still visible (name, role, email)
- [ ] Logout button works
- [ ] Alfred hint visible
- [ ] More space for metrics

### Testing Checklist
- [ ] Login still works
- [ ] User info displays correctly
- [ ] Logout button functional
- [ ] Responsive on mobile
- [ ] No console errors

---

## 💬 AGENT 3: Real-Time Chat System

**Estimated Time**: 15-20 hours

### Your Mission
Implement an iPhone Messages-style chat system that slides up from the bottom-right corner for team communication.

### What You Need to Build

#### 1. Chat Bubble Trigger
- Fixed position: bottom-right (24px from edges)
- Circular button with message icon
- Unread count badge (red dot with number)
- Pulse animation for new messages

#### 2. Chat Panel Design
- **Size**: 380px × 600px
- **Position**: Slides up from bottom-right
- **Border Radius**: 24px (top), 0px (bottom)
- **Background**: Glassmorphic (rgba(0,0,0,0.8) + backdrop blur)
- **Border**: 1px cyan with glow

**Panel Structure**:
```
┌─────────────────────────────┐
│ Header                    × │  ← Close button
├─────────────────────────────┤
│ User List / Channels        │  ← Tabs: DMs | Groups
├─────────────────────────────┤
│                             │
│   Message Thread            │  ← Scrollable
│                             │
├─────────────────────────────┤
│ [Type a message...]    [→] │  ← Input
└─────────────────────────────┘
```

#### 3. Message Bubbles

**Sent (right-aligned)**:
- Background: Cyan gradient (#00D9FF → #0099CC)
- Text: Black
- Border radius: 18px 18px 4px 18px
- Max width: 70%

**Received (left-aligned)**:
- Background: Dark gray (#2C2C2E)
- Text: White
- Border radius: 18px 18px 18px 4px
- Max width: 70%

#### 4. Animations

```tsx
const chatVariants = {
  hidden: { y: "100%", opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", damping: 25, stiffness: 300 }
  }
};
```

#### 5. Features
- [x] Direct messages (1-on-1)
- [x] Group chats
- [x] User mentions (@username)
- [x] Timestamps
- [x] Read receipts
- [x] Typing indicators
- [x] Unread badges

#### 6. Keyboard Shortcuts
- **Cmd+M**: Toggle chat
- **ESC**: Close chat (don't break Alfred's ESC)
- **Enter**: Send message
- **Shift+Enter**: New line

### Technical Implementation

**Frontend Components**:
```
components/chat/
├── chat-bubble-trigger.tsx
├── chat-panel.tsx
├── chat-header.tsx
├── user-list.tsx
├── message-thread.tsx
├── message-bubble.tsx
├── message-input.tsx
├── typing-indicator.tsx
└── chat-context.tsx
```

**Backend Endpoints** (add to `main.py`):
```python
@app.websocket("/ws/chat/{user_id}")
async def chat_websocket(websocket: WebSocket, user_id: int):
    # WebSocket for real-time messaging
    pass

@app.get("/api/chat/conversations")
async def get_conversations():
    # Get user's conversations
    pass

@app.get("/api/chat/messages/{conversation_id}")
async def get_messages(conversation_id: int):
    # Get messages
    pass

@app.post("/api/chat/send")
async def send_message(message: ChatMessage):
    # Send message
    pass

@app.post("/api/chat/typing")
async def send_typing_indicator(conversation_id: int):
    # Typing indicator
    pass
```

**Database Schema** (if using PostgreSQL):
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20),
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conversation_participants (
    conversation_id INT REFERENCES conversations(id),
    user_id INT REFERENCES users(id),
    last_read_at TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id),
    sender_id INT REFERENCES users(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**NPM Packages to Install**:
```bash
npm install socket.io-client react-textarea-autosize
```

### Success Criteria
- [ ] Chat slides smoothly from bottom-right
- [ ] iPhone-style message bubbles
- [ ] Real-time delivery (<500ms)
- [ ] 60fps animations
- [ ] ESC closes chat
- [ ] Unread counts update
- [ ] Mobile responsive

### Testing Checklist
- [ ] Dashboard layout unaffected
- [ ] Cmd+K for Alfred still works
- [ ] ESC doesn't break other modals
- [ ] No performance degradation
- [ ] Login/logout still works

---

## 👨‍💼 AGENT 4: Admin Settings & User Management

**Estimated Time**: 10-15 hours

### Your Mission
Create a comprehensive admin panel for CEO to manage users, permissions, and system settings.

### What Currently Exists
- No admin interface
- Users in MOCK_USERS dictionary
- No way to modify permissions after creation

### What You Need to Build

#### 1. Admin Settings Route
- Route: `/admin/settings`
- Protected: Only CEO can access
- Add link to dashboard header (with permission gate)

```tsx
<PermissionGate requiredPermissions={['admin.settings.access']}>
  <Link href="/admin/settings">
    <Settings className="w-5 h-5" />
    Admin Settings
  </Link>
</PermissionGate>
```

#### 2. Admin Panel Layout

**Sidebar**:
```
Admin Settings
├── 👥 Users
├── 🔐 Permissions
├── 📊 System Logs
├── ⚙️ Configuration
└── 📈 Analytics
```

#### 3. User Management

**User List Table**:
- Columns: Avatar, Name, Email, Role, Department, Status, Last Login, Actions
- Features: Search, filter, sort, pagination (20/page)
- Actions: Edit, Delete, View Permissions

**Add User Modal**:
- Fields: Name, Email, Role, Department, Password
- Roles: CEO, Co-Founder, Sales Agent
- Validation: Required fields, email format

**Edit User**:
- Pre-filled form
- Option: Force password reset
- Can deactivate user

**Delete User**:
- Confirmation dialog
- Soft delete (mark inactive)

#### 4. Permission Management

**Permission Matrix**:
```
Feature                | CEO | Co-Founder | Sales
-----------------------|-----|------------|-------
Metrics: MRR          | ✓   | ✓          | ✓
Metrics: LTV          | ✓   | ✓          | ✗
KPIs: Sales           | ✓   | ✓          | ✓
KPIs: Finance         | ✓   | ✓          | ✗
Alfred: Chat          | ✓   | ✓          | ✓
Admin: Settings       | ✓   | ✗          | ✗
```

**Individual Permissions**:
- Toggle switches per permission
- Grouped by category
- Real-time updates (user sees changes immediately)

#### 5. System Logs

**Track**:
- User login/logout
- User CRUD operations
- Permission changes
- Failed login attempts

**Display**:
- Table: Timestamp, User, Action, Details, IP
- Filters: Date range, User, Action type
- Export to CSV

#### 6. Configuration

**System Settings**:
- Company name
- Logo upload
- Theme color
- Session timeout
- Password policy

**Integrations**:
- Google Sheets credentials
- OpenAI API key
- Webhooks

### Technical Implementation

**Frontend Structure**:
```
app/admin/
├── layout.tsx
├── settings/
│   ├── page.tsx
│   ├── users/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── new/page.tsx
│   ├── permissions/page.tsx
│   ├── logs/page.tsx
│   └── config/page.tsx

components/admin/
├── admin-sidebar.tsx
├── user-table.tsx
├── user-form.tsx
├── permission-matrix.tsx
├── audit-log-table.tsx
└── config-form.tsx
```

**Backend Endpoints** (add to `main.py`):
```python
# User Management
@app.get("/api/admin/users")
async def get_all_users():
    # Return all users
    pass

@app.post("/api/admin/users")
async def create_user(user: UserCreate):
    # Create user
    pass

@app.put("/api/admin/users/{user_id}")
async def update_user(user_id: int, user: UserUpdate):
    # Update user
    pass

@app.delete("/api/admin/users/{user_id}")
async def delete_user(user_id: int):
    # Soft delete
    pass

# Permissions
@app.get("/api/admin/users/{user_id}/permissions")
async def get_user_permissions(user_id: int):
    pass

@app.put("/api/admin/users/{user_id}/permissions")
async def update_user_permissions(user_id: int, permissions: dict):
    pass

# Logs
@app.get("/api/admin/logs")
async def get_audit_logs(skip: int = 0, limit: int = 50):
    pass

# Config
@app.get("/api/admin/config")
async def get_system_config():
    pass

@app.put("/api/admin/config")
async def update_system_config(config: SystemConfig):
    pass
```

**Database Schema** (if using PostgreSQL):
```sql
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE system_config (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Success Criteria
- [ ] Only CEO can access admin settings
- [ ] CEO can create/edit/delete users
- [ ] Permission changes apply immediately
- [ ] All actions are logged
- [ ] UI matches dashboard aesthetic
- [ ] Forms have validation
- [ ] Confirmation for destructive actions

### Testing Checklist
- [ ] Non-admin users can't access admin panel
- [ ] Current users still work
- [ ] Permissions still functional
- [ ] Login/logout unaffected
- [ ] No console errors

---

## 📋 Execution Order (Recommended)

1. **Agent 2** (UI Cleanup) - 2-3 hours - Quick win
2. **Agent 1** (Metrics) - 8-12 hours - Impressive visuals
3. **Agent 4** (Admin) - 10-15 hours - Critical functionality
4. **Agent 3** (Chat) - 15-20 hours - Complex feature

**Total**: ~35-50 hours

---

## ✅ Final Checklist (After ALL Agents Complete)

- [ ] Login/logout works
- [ ] All 5 metrics display
- [ ] Permission system intact
- [ ] Alfred AI (Cmd+K) works
- [ ] Dashboard responsive
- [ ] No console errors
- [ ] Backend running on :8000
- [ ] Frontend running on :3000

---

**Good luck! Each prompt is self-contained and ready to paste into a new agent conversation.**
