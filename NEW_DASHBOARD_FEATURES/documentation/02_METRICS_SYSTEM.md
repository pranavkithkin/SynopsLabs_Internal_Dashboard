# Business Metrics System

## 📊 Overview

The Business Metrics System provides automated calculation and tracking of five key business metrics:

1. **MRR** - Monthly Recurring Revenue
2. **CAC** - Customer Acquisition Cost
3. **LTV** - Lifetime Value
4. **QVC** - Quarterly Value Created
5. **LTGP** - Long-Term Growth Potential

All metrics are calculated from Google Sheets data and respect user permissions.

## 🎯 Metrics Explained

### 1. MRR (Monthly Recurring Revenue)

**What it measures**: Predictable monthly revenue from subscriptions

**Components**:
- **New MRR**: Revenue from new customers this month
- **Expansion MRR**: Additional revenue from existing customers (upgrades)
- **Contraction MRR**: Lost revenue from downgrades
- **Churned MRR**: Lost revenue from cancelled customers
- **Net New MRR**: New + Expansion - Contraction - Churned
- **Total MRR**: Previous MRR + Net New MRR

**Calculation**:
```python
total_mrr = sum(customer.mrr for customer in active_customers)
new_mrr = sum(customer.mrr for customer in customers_started_this_month)
churned_mrr = sum(customer.mrr for customer in churned_this_month)
net_change = new_mrr - churned_mrr
```

**Example Display**:
```
MRR: $45,230
↑ 12.5% from last month
New MRR: $8,500
Churned MRR: $2,100
Net Change: +$6,400
```

### 2. CAC (Customer Acquisition Cost)

**What it measures**: Average cost to acquire one customer

**Components**:
- **Marketing Spend**: All marketing expenses
- **Sales Cost**: Sales team costs, tools, etc.
- **Total Spend**: Marketing + Sales
- **New Customers**: Number of customers acquired

**Calculation**:
```python
marketing_spend = sum(expense.amount for expense in marketing_expenses)
sales_cost = sum(expense.amount for expense in sales_expenses)
total_spend = marketing_spend + sales_cost
new_customers = count(customers_acquired_this_month)
cac = total_spend / new_customers
```

**Example Display**:
```
CAC: $1,250
↓ 8.3% from last month
Marketing: $15,000
Sales Cost: $10,000
New Customers: 20
```

### 3. LTV (Lifetime Value)

**What it measures**: Expected revenue from a customer over their lifetime

**Components**:
- **Average MRR**: Average monthly revenue per customer
- **Average Duration**: Average customer lifespan in months
- **Churn Rate**: Percentage of customers who cancel

**Calculation**:
```python
avg_mrr = total_mrr / active_customer_count
avg_duration = sum(customer.plan_duration) / customer_count
ltv = avg_mrr * avg_duration

# Advanced calculation (if you have gross margin):
# ltv = (avg_mrr * gross_margin) / (churn_rate / 100)
```

**Example Display**:
```
LTV: $15,000
↑ 5.2% from last month
Avg MRR: $1,250
Avg Duration: 12 months
Churn Rate: 3.5%
LTV:CAC Ratio: 12:1 ✅
```

**Target**: LTV:CAC ratio should be 3:1 or higher

### 4. QVC (Quarterly Value Created)

**What it measures**: Total value delivered to clients this quarter

**Components**:
- **Projects Completed**: Number of projects finished
- **Value by Type**: Breakdown by value category
  - Cost Savings
  - Revenue Increase
  - Time Savings
  - Strategic Value
- **Top Client**: Client receiving most value

**Calculation**:
```python
quarter_projects = filter_projects_by_quarter(current_quarter)
total_value = sum(project.value_amount for project in quarter_projects)
by_type = group_by(quarter_projects, 'value_type')
avg_per_project = total_value / len(quarter_projects)
```

**Example Display**:
```
QVC: $125,000 (Q4 2024)
Projects: 8 completed
By Type:
  - Cost Savings: $45,000
  - Revenue Increase: $60,000
  - Time Savings: $15,000
  - Strategic: $5,000
Top Client: Acme Corp ($35,000)
```

### 5. LTGP (Long-Term Growth Potential)

**What it measures**: Market opportunity and growth runway

**Components**:
- **TAM**: Total Addressable Market
- **SAM**: Serviceable Addressable Market
- **Current Revenue**: Your current position
- **Market Penetration**: % of SAM captured
- **Growth Probability**: Likelihood of capturing more market
- **Runway**: Remaining market opportunity

**Calculation**:
```python
penetration = (current_revenue / sam) * 100
runway = sam - current_revenue
ltgp_score = runway * growth_probability
```

**Example Display**:
```
LTGP Score: 8.5/10
TAM: $10B
SAM: $500M
Current Revenue: $2M
Penetration: 0.4%
Runway: $498M
Growth Probability: 75%
```

## 🏗️ Architecture

### Data Flow

```
┌─────────────────┐
│  Google Sheets  │
│                 │
│  - Customers    │
│  - Expenses     │
│  - Projects     │
│  - Strategic    │
└────────┬────────┘
         │
         │ Sync (Scheduled)
         ▼
┌─────────────────┐
│ Sheets Service  │
│                 │
│ - Read data     │
│ - Write data    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Metrics Calc    │
│                 │
│ - Calculate MRR │
│ - Calculate CAC │
│ - Calculate LTV │
│ - Calculate QVC │
│ - Calculate LTGP│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │
│                 │
│ - business_     │
│   metrics       │
│ - metric_       │
│   history       │
└────────┬────────┘
         │
         │ Permission Check
         ▼
┌─────────────────┐
│ Metrics Service │
│                 │
│ - Check perms   │
│ - Filter data   │
│ - Return metrics│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Dashboard     │
│   (Frontend)    │
└─────────────────┘
```

### Database Schema

```sql
-- Main metrics table
CREATE TABLE business_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,  -- 'mrr', 'cac', 'ltv', 'qvc', 'ltgp'
    current_value DECIMAL(15, 2),
    previous_value DECIMAL(15, 2),
    change_percentage DECIMAL(5, 2),
    period_start DATE,
    period_end DATE,
    meta_data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Historical tracking
CREATE TABLE metric_history (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(15, 2),
    period_start DATE,
    period_end DATE,
    meta_data JSONB,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Permissions (uses existing permission system)
-- Permissions are checked via permission_service
-- Feature keys: metrics.{type}.view
```

## 🔧 Implementation

### Backend Files

1. **`services/metrics_service.py`**
   - Permission checking
   - Metric access control
   - Data retrieval

2. **`services/metrics_calculator.py`**
   - Calculation logic for each metric
   - Data aggregation
   - Trend analysis

3. **`services/sheets_service.py`**
   - Google Sheets API integration
   - Data sync
   - Read/write operations

4. **`services/metrics_sync.py`**
   - Scheduled sync jobs
   - Automatic calculation
   - Data refresh

5. **`routers/metrics.py`**
   - API endpoints
   - Permission validation
   - Response formatting

6. **`models/business_metric.py`**
   - Database models
   - Relationships
   - Validation

### API Endpoints

```python
# Get user's accessible metrics
GET /api/metrics/
Response: {
  "mrr": { "current_value": 45230, "change_percentage": 12.5, ... },
  "cac": { "current_value": 1250, "change_percentage": -8.3, ... },
  # Only includes metrics user has permission to view
}

# Get specific metric with history
GET /api/metrics/{metric_type}
Response: {
  "current": { ... },
  "history": [ ... ],
  "components": { ... }
}

# Get metric history
GET /api/metrics/{metric_type}/history?limit=12
Response: [
  { "period": "2024-11", "value": 45230 },
  { "period": "2024-10", "value": 40200 },
  ...
]

# Manual entry (CEO only)
POST /api/metrics/manual-entry
Body: {
  "metric_type": "mrr",
  "value": 45230,
  "period_end": "2024-11-30",
  "notes": "Manual adjustment"
}
```

## 🔐 Permission System

### Permission Keys

```python
"metrics.mrr.view"       # View MRR
"metrics.mrr.export"     # Export MRR data
"metrics.mrr.history"    # View MRR history

"metrics.cac.view"       # View CAC
"metrics.ltv.view"       # View LTV
"metrics.qvc.view"       # View QVC
"metrics.ltgp.view"      # View LTGP
```

### Permission Check Example

```python
# In metrics_service.py
async def get_user_metrics(db, user_id):
    user = db.query(User).filter(User.id == user_id).first()
    
    # CEO sees everything
    if user.role == "ceo":
        metric_types = ["mrr", "cac", "ltv", "qvc", "ltgp"]
    else:
        # Check each metric permission
        metric_types = []
        for m_type in ["mrr", "cac", "ltv", "qvc", "ltgp"]:
            if permission_service.check_permission(
                user, f"metrics.{m_type}.view"
            ):
                metric_types.append(m_type)
    
    # Fetch only permitted metrics
    result = {}
    for metric_type in metric_types:
        result[metric_type] = get_metric_data(metric_type)
    
    return result
```

## 📈 Sync Schedule

Metrics are automatically calculated on a schedule:

```python
# Daily sync (for real-time metrics)
@scheduler.scheduled_job('cron', hour=0, minute=0)
async def daily_metrics_sync():
    # Sync Google Sheets data
    # Calculate MRR, CAC, LTV
    # Update database

# Weekly sync (for trend analysis)
@scheduler.scheduled_job('cron', day_of_week='mon', hour=1)
async def weekly_metrics_sync():
    # Calculate weekly trends
    # Generate insights

# Monthly sync (for historical tracking)
@scheduler.scheduled_job('cron', day=1, hour=2)
async def monthly_metrics_sync():
    # Archive monthly data
    # Calculate QVC
    # Update LTGP
```

## 🎨 Frontend Integration

### Display Components

```typescript
// Fetch metrics
const { data: metrics } = useQuery('metrics', async () => {
  const response = await fetch('/api/metrics/');
  return response.json();
});

// Display metric card
<MetricCard
  title="MRR"
  value={metrics.mrr?.current_value}
  change={metrics.mrr?.change_percentage}
  trend={metrics.mrr?.change_percentage > 0 ? 'up' : 'down'}
  permission={hasPermission('metrics.mrr.view')}
/>

// If no permission, show locked state
{!hasPermission('metrics.mrr.view') && (
  <LockedMetric
    title="MRR"
    message="Contact your CEO for access"
  />
)}
```

## 💡 Best Practices

1. **Sync regularly** but not too frequently (avoid API limits)
2. **Cache metrics** to reduce database queries
3. **Validate data** from Google Sheets before calculation
4. **Handle errors gracefully** (missing data, API failures)
5. **Log calculations** for debugging
6. **Test with edge cases** (zero customers, negative values)

## 🚀 Getting Started

1. Set up Google Sheets (see Google Sheets Setup guide)
2. Copy backend files to your project
3. Configure environment variables
4. Run initial sync
5. Test metric calculations
6. Verify permissions work correctly
7. Integrate frontend components

## 📊 Example Google Sheets Structure

See `google_sheets_setup/spreadsheet_template.md` for detailed structure.
