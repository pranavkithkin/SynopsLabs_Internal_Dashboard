# Backend Files Index

## 📁 Overview

This directory contains all the backend files needed to implement Alfred AI, business metrics, and KPI tracking features.

## 🗂️ File Structure

```
backend_files/
├── services/
│   ├── alfred_service.py          # Alfred AI service with OpenAI integration
│   ├── permission_service.py      # Permission checking and management
│   ├── metrics_service.py         # Metrics access and permission control
│   ├── metrics_calculator.py      # Business metrics calculation logic
│   ├── sheets_service.py          # Google Sheets integration
│   └── metrics_sync.py            # Scheduled metrics sync
├── models/
│   ├── alfred_session.py          # Alfred conversation sessions
│   ├── business_metric.py         # Business metrics models
│   ├── permission.py              # Permission system models
│   └── user.py                    # User model
├── routers/
│   ├── alfred.py                  # Alfred API endpoints
│   └── metrics.py                 # Metrics API endpoints
├── schemas/
│   ├── alfred.py                  # Alfred Pydantic schemas
│   └── metrics.py                 # Metrics Pydantic schemas
├── metrics_schema.sql             # Database schema for metrics
└── setup_permissions.sql          # Initial permission setup
```

## 📄 File Descriptions

### Services

#### `alfred_service.py`
**Purpose**: Main Alfred AI service with OpenAI integration

**Key Features**:
- OpenAI GPT-4 integration
- Function calling (create tasks, schedule meetings, etc.)
- Permission-aware responses
- Conversation history management
- Context building (metrics, integrations, notifications)

**Main Classes/Functions**:
- `AlfredService` - Main service class
- `chat()` - Process chat messages
- `execute_function()` - Execute function calls
- `get_system_prompt()` - Build context-aware prompt
- `_get_user_metrics()` - Get permission-filtered metrics

**Dependencies**:
- OpenAI API
- Permission Service
- Metrics Service
- Database models

---

#### `permission_service.py`
**Purpose**: Handle all permission checking and management

**Key Features**:
- Permission hierarchy (CEO → User Override → Role Default → System Default)
- Check user permissions
- Grant/revoke permissions
- Role-based defaults
- Bulk permission updates

**Main Classes/Functions**:
- `PermissionService` - Main service class
- `get_user_effective_permissions()` - Get all user permissions
- `check_permission()` - Check specific permission
- `set_user_permission()` - Grant/revoke permission
- `set_role_default()` - Set role defaults

**Usage Example**:
```python
permission_service = PermissionService(db)
can_view = permission_service.check_permission(user, "metrics.mrr.view")
```

---

#### `metrics_service.py`
**Purpose**: Business metrics access control and data retrieval

**Key Features**:
- Permission-based metric access
- Metric permission management
- User metrics retrieval
- Metric history tracking
- Manual metric entry (CEO only)

**Main Classes/Functions**:
- `MetricsService` - Main service class
- `check_metric_permission()` - Check metric access
- `get_user_metrics()` - Get accessible metrics
- `grant_metric_permission()` - Grant metric access
- `manual_entry()` - Manual metric entry

**Usage Example**:
```python
metrics = await metrics_service.get_user_metrics(db, user_id)
# Returns only metrics user has permission to view
```

---

#### `metrics_calculator.py`
**Purpose**: Calculate business metrics from raw data

**Key Features**:
- MRR calculation with components
- CAC calculation from expenses
- LTV calculation from customer data
- QVC calculation from projects
- LTGP calculation from strategic data
- LTV:CAC ratio calculation

**Main Classes/Functions**:
- `MetricsCalculator` - Main calculator class
- `calculate_mrr()` - Calculate MRR
- `calculate_cac()` - Calculate CAC
- `calculate_ltv()` - Calculate LTV
- `calculate_qvc()` - Calculate QVC
- `calculate_ltgp()` - Calculate LTGP

**Usage Example**:
```python
mrr_data = metrics_calculator.calculate_mrr(customers)
# Returns: { 'current': 45230, 'previous': 40200, ... }
```

---

#### `sheets_service.py`
**Purpose**: Google Sheets API integration

**Key Features**:
- Read/write Google Sheets data
- Sync customers, expenses, projects, strategic data
- Add new records to sheets
- Error handling for API failures

**Main Classes/Functions**:
- `GoogleSheetsService` - Main service class
- `sync_customers()` - Read customer data
- `sync_expenses()` - Read expense data
- `sync_projects()` - Read project data
- `sync_strategic()` - Read strategic data
- `add_customer()` - Add customer to sheet
- `add_expense()` - Add expense to sheet
- `add_project()` - Add project to sheet

**Usage Example**:
```python
customers = sheets_service.sync_customers()
# Returns list of customer dictionaries
```

---

#### `metrics_sync.py`
**Purpose**: Scheduled synchronization of metrics

**Key Features**:
- Automated daily/weekly/monthly sync
- Fetch data from Google Sheets
- Calculate all metrics
- Store in database
- Error handling and logging

**Main Functions**:
- `sync_all_metrics()` - Sync all metrics
- `sync_daily_metrics()` - Daily sync job
- `sync_weekly_metrics()` - Weekly sync job
- `sync_monthly_metrics()` - Monthly sync job

---

### Models

#### `alfred_session.py`
**Purpose**: Store Alfred conversation sessions

**Fields**:
- `id` - Session ID
- `user_id` - User who owns the session
- `conversation` - JSON array of messages
- `channel` - Where conversation happened (dashboard, telegram, etc.)
- `created_at` - Session start time
- `updated_at` - Last message time

---

#### `business_metric.py`
**Purpose**: Store business metrics and related data

**Models**:
- `BusinessMetric` - Main metrics table
- `MetricHistory` - Historical tracking
- `MetricPermission` - Metric-specific permissions
- `MRRComponent` - MRR breakdown
- `CustomerCohort` - Customer segmentation
- `CACByChannel` - CAC by marketing channel
- `LTVBySegment` - LTV by customer segment
- `QVCProject` - QVC project tracking
- `LTGPMarketData` - LTGP market data
- `LTGPInitiative` - LTGP growth initiatives

---

#### `permission.py`
**Purpose**: Permission system models

**Models**:
- `SystemFeature` - Available features
- `UserPermission` - User-specific permissions
- `RoleDefault` - Role-based defaults

---

#### `user.py`
**Purpose**: User model

**Fields**:
- `id` - User ID
- `email` - User email
- `name` - User name
- `role` - User role (ceo, manager, employee, etc.)
- `department` - User department
- Other user fields...

---

### Routers

#### `alfred.py`
**Purpose**: Alfred API endpoints

**Endpoints**:
- `POST /api/alfred/chat` - Send message to Alfred
- `GET /api/alfred/sessions` - Get user's conversations
- `GET /api/alfred/sessions/{id}` - Get specific conversation
- `DELETE /api/alfred/sessions/{id}` - Delete conversation

---

#### `metrics.py`
**Purpose**: Metrics API endpoints

**Endpoints**:
- `GET /api/metrics/` - Get all accessible metrics
- `GET /api/metrics/{type}` - Get specific metric
- `GET /api/metrics/{type}/history` - Get metric history
- `POST /api/metrics/manual-entry` - Manual metric entry (CEO only)
- `POST /api/metrics/sync` - Trigger manual sync

---

### Schemas

#### `alfred.py`
**Purpose**: Pydantic schemas for Alfred

**Schemas**:
- `ChatMessage` - Chat message format
- `ChatRequest` - Chat request body
- `ChatResponse` - Chat response format
- `FunctionCall` - Function call result

---

#### `metrics.py`
**Purpose**: Pydantic schemas for metrics

**Schemas**:
- `MetricBase` - Base metric schema
- `MetricResponse` - Metric response format
- `ManualMetricEntry` - Manual entry format
- `MRRComponentCreate` - MRR component creation
- `CACByChannelCreate` - CAC breakdown creation
- And more...

---

### SQL Files

#### `metrics_schema.sql`
**Purpose**: Database schema for metrics tables

**Tables Created**:
- `business_metrics` - Main metrics table
- `metric_history` - Historical tracking
- `metric_permissions` - Metric permissions
- `mrr_components` - MRR breakdown
- `customer_cohorts` - Customer segments
- `cac_by_channel` - CAC by channel
- `ltv_by_segment` - LTV by segment
- `qvc_projects` - QVC projects
- `ltgp_market_data` - LTGP market data
- `ltgp_initiatives` - LTGP initiatives

---

#### `setup_permissions.sql`
**Purpose**: Initialize permission system

**What it does**:
- Creates system features
- Sets up role defaults
- Initializes permission tables

---

## 🔧 Integration Steps

### 1. Copy Files to Your Project

```bash
# Copy services
cp backend_files/services/* your_project/backend/services/

# Copy models
cp backend_files/models/* your_project/backend/models/

# Copy routers
cp backend_files/routers/* your_project/backend/routers/

# Copy schemas
cp backend_files/schemas/* your_project/backend/schemas/
```

### 2. Run Database Migrations

```bash
# Run metrics schema
psql -U your_user -d your_database -f backend_files/metrics_schema.sql

# Run permissions setup
psql -U your_user -d your_database -f backend_files/setup_permissions.sql
```

### 3. Install Dependencies

```bash
pip install openai google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client
```

### 4. Configure Environment Variables

```env
# OpenAI
OPENAI_API_KEY=your_key_here

# Google Sheets
GOOGLE_SHEETS_ID=your_spreadsheet_id
GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/credentials.json
```

### 5. Test Integration

```python
# Test Alfred
from services.alfred_service import AlfredService
alfred = AlfredService()
response = await alfred.chat("Hello", user_id=1, ...)

# Test Metrics
from services.metrics_service import metrics_service
metrics = await metrics_service.get_user_metrics(db, user_id=1)

# Test Permissions
from services.permission_service import PermissionService
ps = PermissionService(db)
can_view = ps.check_permission(user, "metrics.mrr.view")
```

## 📝 Customization Guide

### Adding New Metrics

1. Add calculation logic to `metrics_calculator.py`
2. Add database model to `business_metric.py`
3. Add sync logic to `metrics_sync.py`
4. Add API endpoint to `metrics.py`
5. Add permission keys to `setup_permissions.sql`

### Adding New Alfred Functions

1. Add function schema to `get_functions_schema()` in `alfred_service.py`
2. Add execution logic to `execute_function()` in `alfred_service.py`
3. Add permission check if needed
4. Test thoroughly

### Customizing Permissions

1. Add new feature keys to `system_features` table
2. Set role defaults in `role_defaults` table
3. Update permission service if needed
4. Test with different roles

## 🐛 Common Issues

### Import Errors
**Solution**: Ensure all dependencies are installed and paths are correct

### Database Errors
**Solution**: Run SQL schema files and check database connection

### Permission Errors
**Solution**: Verify permission setup and check user roles

### Google Sheets Errors
**Solution**: Check credentials, spreadsheet ID, and sharing settings

## 📚 Additional Resources

- See documentation files for detailed guides
- Check inline comments in code files
- Refer to API documentation for endpoints
- Review test files for usage examples

## ✅ Checklist

Before deploying:

- [ ] All files copied to project
- [ ] Database schemas applied
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Google Sheets set up
- [ ] Permissions initialized
- [ ] Tests passing
- [ ] Documentation reviewed
