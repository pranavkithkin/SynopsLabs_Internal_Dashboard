# KPI Tracking System - Enterprise-Grade

## 📊 Overview

A comprehensive KPI (Key Performance Indicator) tracking system that enables organizations to monitor performance metrics across different time horizons:

- **Daily KPIs**: Real-time operational metrics
- **Weekly KPIs**: Short-term trend analysis
- **Monthly KPIs**: Strategic performance tracking
- **Custom KPIs**: Organization-specific metrics

## 🎯 System Features

### 1. Multi-Timeframe Tracking

Track KPIs across different time periods:

```
Daily KPIs (Today vs Yesterday)
├── Sales calls made
├── Leads generated
├── Support tickets resolved
├── Active users
└── Revenue generated

Weekly KPIs (This Week vs Last Week)
├── New customers acquired
├── Churn rate
├── Customer satisfaction score
├── Team productivity
└── Marketing ROI

Monthly KPIs (This Month vs Last Month)
├── MRR growth
├── Customer lifetime value
├── Net promoter score
├── Employee satisfaction
└── Strategic goal progress
```

### 2. Goal Setting & Tracking

Set targets and track progress:

```
KPI: Daily Sales Calls
Target: 50 calls/day
Actual: 47 calls
Progress: 94% ✅
Status: On Track

KPI: Monthly MRR Growth
Target: 15% growth
Actual: 12.5% growth
Progress: 83% ⚠️
Status: Needs Attention
```

### 3. Trend Analysis

Visualize performance over time:

```
Daily Active Users (Last 30 Days)
┌─────────────────────────────────────┐
│                              ╱╲     │
│                         ╱╲  ╱  ╲    │
│                    ╱╲  ╱  ╲╱    ╲   │
│               ╱╲  ╱  ╲╱          ╲  │
│          ╱╲  ╱  ╲╱                ╲ │
│     ╱╲  ╱  ╲╱                      ╲│
│╱╲  ╱  ╲╱                            │
└─────────────────────────────────────┘
Trend: ↑ 23% (Growing)
```

### 4. Alerts & Notifications

Get notified when KPIs need attention:

```
🔴 CRITICAL: Daily Revenue 45% below target
🟡 WARNING: Customer Churn Rate increased by 15%
🟢 SUCCESS: Weekly Sales Target exceeded by 120%
```

## 🏗️ Architecture

### Database Schema

```sql
-- KPI Definitions
CREATE TABLE kpi_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),  -- 'sales', 'marketing', 'operations', 'finance', 'custom'
    tracking_period VARCHAR(50),  -- 'daily', 'weekly', 'monthly'
    unit VARCHAR(50),  -- 'number', 'currency', 'percentage', 'time'
    calculation_method TEXT,  -- How to calculate this KPI
    data_source VARCHAR(100),  -- Where data comes from
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- KPI Targets
CREATE TABLE kpi_targets (
    id SERIAL PRIMARY KEY,
    kpi_id INT REFERENCES kpi_definitions(id),
    target_value DECIMAL(15, 2),
    period_start DATE,
    period_end DATE,
    set_by INT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- KPI Values (Actual Data)
CREATE TABLE kpi_values (
    id SERIAL PRIMARY KEY,
    kpi_id INT REFERENCES kpi_definitions(id),
    value DECIMAL(15, 2),
    period_date DATE,  -- The date this value represents
    period_type VARCHAR(50),  -- 'daily', 'weekly', 'monthly'
    meta_data JSONB,  -- Additional context
    recorded_at TIMESTAMP DEFAULT NOW(),
    recorded_by INT REFERENCES users(id)
);

-- KPI Alerts
CREATE TABLE kpi_alerts (
    id SERIAL PRIMARY KEY,
    kpi_id INT REFERENCES kpi_definitions(id),
    alert_type VARCHAR(50),  -- 'below_target', 'above_target', 'trend_down', 'trend_up'
    threshold_percentage DECIMAL(5, 2),  -- Alert when X% off target
    notification_channels JSONB,  -- ['email', 'slack', 'dashboard']
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT REFERENCES users(id)
);

-- KPI Permissions
CREATE TABLE kpi_permissions (
    id SERIAL PRIMARY KEY,
    kpi_id INT REFERENCES kpi_definitions(id),
    user_id INT REFERENCES users(id),
    can_view BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_set_targets BOOLEAN DEFAULT FALSE,
    granted_by INT REFERENCES users(id),
    granted_at TIMESTAMP DEFAULT NOW()
);
```

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Data Sources                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Google   │  │ Database │  │   API    │  │ Manual  │ │
│  │ Sheets   │  │ Queries  │  │  Calls   │  │  Entry  │ │
│  └─────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘ │
└────────┼────────────┼─────────────┼──────────────┼──────┘
         │            │             │              │
         └────────────┴─────────────┴──────────────┘
                              │
                              ▼
         ┌────────────────────────────────────────┐
         │        KPI Collection Service          │
         │  - Fetch data from sources             │
         │  - Validate and normalize              │
         │  - Calculate derived metrics           │
         └───────────────┬────────────────────────┘
                         │
                         ▼
         ┌────────────────────────────────────────┐
         │        KPI Calculation Engine          │
         │  - Apply calculation formulas          │
         │  - Aggregate by time period            │
         │  - Compare to targets                  │
         └───────────────┬────────────────────────┘
                         │
                         ▼
         ┌────────────────────────────────────────┐
         │           KPI Database                 │
         │  - Store values                        │
         │  - Track history                       │
         │  - Maintain targets                    │
         └───────────────┬────────────────────────┘
                         │
                         ▼
         ┌────────────────────────────────────────┐
         │         Alert & Notification           │
         │  - Check thresholds                    │
         │  - Send notifications                  │
         │  - Log alerts                          │
         └───────────────┬────────────────────────┘
                         │
                         ▼
         ┌────────────────────────────────────────┐
         │        KPI Dashboard API               │
         │  - Permission checking                 │
         │  - Data formatting                     │
         │  - Trend analysis                      │
         └───────────────┬────────────────────────┘
                         │
                         ▼
         ┌────────────────────────────────────────┐
         │         Frontend Dashboard             │
         │  - KPI cards                           │
         │  - Charts & graphs                     │
         │  - Alerts & notifications              │
         └────────────────────────────────────────┘
```

## 📊 Pre-Defined KPI Categories

### Sales KPIs

#### Daily
- **Sales Calls Made**: Number of outbound calls
- **Leads Generated**: New leads added to pipeline
- **Demos Scheduled**: Product demonstrations booked
- **Deals Closed**: Contracts signed
- **Revenue Generated**: Daily sales revenue

#### Weekly
- **Pipeline Value**: Total value of opportunities
- **Conversion Rate**: Leads to customers ratio
- **Average Deal Size**: Mean contract value
- **Sales Cycle Length**: Days from lead to close
- **Win Rate**: Deals won vs lost

#### Monthly
- **New Customers**: Total new customers acquired
- **Customer Acquisition Cost (CAC)**: Cost per customer
- **Sales Team Quota Attainment**: % of quota achieved
- **Revenue Growth**: Month-over-month growth
- **Customer Retention Rate**: % of customers retained

### Marketing KPIs

#### Daily
- **Website Visitors**: Unique daily visitors
- **Ad Spend**: Daily advertising budget
- **Social Media Engagement**: Likes, shares, comments
- **Email Open Rate**: % of emails opened
- **Content Published**: Blog posts, videos created

#### Weekly
- **Lead Quality Score**: Average lead score
- **Marketing Qualified Leads (MQLs)**: Leads ready for sales
- **Cost Per Lead (CPL)**: Marketing spend per lead
- **Campaign Performance**: ROI by campaign
- **Brand Mentions**: Social media mentions

#### Monthly
- **Marketing ROI**: Return on marketing investment
- **Customer Lifetime Value (LTV)**: Expected customer value
- **LTV:CAC Ratio**: Efficiency metric
- **Organic Traffic Growth**: SEO performance
- **Conversion Rate**: Visitors to leads ratio

### Operations KPIs

#### Daily
- **Support Tickets Resolved**: Customer issues fixed
- **Average Response Time**: Time to first response
- **System Uptime**: % of time systems are available
- **Active Users**: Daily active users (DAU)
- **Error Rate**: System errors per 1000 requests

#### Weekly
- **Customer Satisfaction (CSAT)**: Support satisfaction score
- **First Contact Resolution**: % resolved on first contact
- **Team Utilization**: % of capacity used
- **Process Efficiency**: Time saved through automation
- **Quality Score**: Product/service quality metrics

#### Monthly
- **Net Promoter Score (NPS)**: Customer loyalty metric
- **Employee Productivity**: Output per employee
- **Operational Costs**: Total operational expenses
- **Capacity Utilization**: % of resources used
- **Process Compliance**: % of processes followed

### Finance KPIs

#### Daily
- **Cash Balance**: Available cash
- **Daily Revenue**: Revenue generated today
- **Daily Expenses**: Expenses incurred today
- **Accounts Receivable**: Money owed to company
- **Accounts Payable**: Money company owes

#### Weekly
- **Burn Rate**: Weekly cash consumption
- **Runway**: Months of cash remaining
- **Payment Collection Rate**: % of invoices paid
- **Budget Variance**: Actual vs budgeted spend
- **Profit Margin**: Profit as % of revenue

#### Monthly
- **Monthly Recurring Revenue (MRR)**: Subscription revenue
- **Gross Margin**: Revenue minus cost of goods sold
- **Operating Expenses**: Total operating costs
- **EBITDA**: Earnings before interest, taxes, etc.
- **Cash Flow**: Net cash movement

## 🔧 Implementation

### Backend Files Structure

```
backend/
├── models/
│   ├── kpi_definition.py
│   ├── kpi_target.py
│   ├── kpi_value.py
│   ├── kpi_alert.py
│   └── kpi_permission.py
├── services/
│   ├── kpi_service.py          # Main KPI logic
│   ├── kpi_calculator.py       # Calculation engine
│   ├── kpi_collector.py        # Data collection
│   ├── kpi_alert_service.py    # Alert management
│   └── kpi_sync.py             # Scheduled sync
├── routers/
│   └── kpis.py                 # API endpoints
└── schemas/
    └── kpi.py                  # Pydantic schemas
```

### API Endpoints

```python
# Get all KPIs for user (permission-filtered)
GET /api/kpis/
Query params: ?period=daily|weekly|monthly&category=sales|marketing|operations|finance

# Get specific KPI with history
GET /api/kpis/{kpi_id}
Query params: ?days=30

# Create new KPI definition (CEO/Admin only)
POST /api/kpis/definitions
Body: {
  "name": "Daily Sales Calls",
  "category": "sales",
  "tracking_period": "daily",
  "unit": "number",
  "calculation_method": "count",
  "data_source": "crm_api"
}

# Set KPI target
POST /api/kpis/{kpi_id}/targets
Body: {
  "target_value": 50,
  "period_start": "2024-12-01",
  "period_end": "2024-12-31"
}

# Record KPI value
POST /api/kpis/{kpi_id}/values
Body: {
  "value": 47,
  "period_date": "2024-11-24",
  "meta_data": {"notes": "Holiday impact"}
}

# Get KPI dashboard summary
GET /api/kpis/dashboard
Response: {
  "daily": [...],
  "weekly": [...],
  "monthly": [...],
  "alerts": [...]
}

# Configure KPI alert
POST /api/kpis/{kpi_id}/alerts
Body: {
  "alert_type": "below_target",
  "threshold_percentage": 20,
  "notification_channels": ["email", "dashboard"]
}
```

### Calculation Examples

```python
# Daily KPI Calculation
class KPICalculator:
    
    @staticmethod
    def calculate_daily_kpi(kpi_definition, date):
        """Calculate KPI value for a specific day"""
        if kpi_definition.calculation_method == "count":
            # Count records for the day
            value = db.query(Record).filter(
                Record.date == date
            ).count()
        
        elif kpi_definition.calculation_method == "sum":
            # Sum values for the day
            value = db.query(func.sum(Record.amount)).filter(
                Record.date == date
            ).scalar()
        
        elif kpi_definition.calculation_method == "average":
            # Average values for the day
            value = db.query(func.avg(Record.value)).filter(
                Record.date == date
            ).scalar()
        
        # Compare to target
        target = get_target_for_date(kpi_definition.id, date)
        progress = (value / target.target_value * 100) if target else None
        
        return {
            "value": value,
            "target": target.target_value if target else None,
            "progress": progress,
            "status": get_status(progress)
        }
    
    @staticmethod
    def get_status(progress):
        """Determine KPI status based on progress"""
        if progress is None:
            return "no_target"
        elif progress >= 100:
            return "exceeds"
        elif progress >= 80:
            return "on_track"
        elif progress >= 60:
            return "needs_attention"
        else:
            return "critical"
```

## 🎨 Frontend Components

### KPI Dashboard Layout

```typescript
// Daily KPIs Section
<KPIDashboard period="daily">
  <KPICard
    title="Sales Calls Made"
    value={47}
    target={50}
    progress={94}
    status="on_track"
    trend="+5 from yesterday"
  />
  <KPICard
    title="Leads Generated"
    value={23}
    target={20}
    progress={115}
    status="exceeds"
    trend="+8 from yesterday"
  />
  {/* More daily KPIs */}
</KPIDashboard>

// Weekly KPIs Section
<KPIDashboard period="weekly">
  <KPICard
    title="New Customers"
    value={12}
    target={15}
    progress={80}
    status="on_track"
    trend="+3 from last week"
    chart={<WeeklyTrendChart data={weeklyData} />}
  />
  {/* More weekly KPIs */}
</KPIDashboard>

// Monthly KPIs Section
<KPIDashboard period="monthly">
  <KPICard
    title="MRR Growth"
    value="12.5%"
    target="15%"
    progress={83}
    status="needs_attention"
    trend="+2.3% from last month"
    chart={<MonthlyTrendChart data={monthlyData} />}
  />
  {/* More monthly KPIs */}
</KPIDashboard>
```

### KPI Card Component

```typescript
interface KPICardProps {
  title: string;
  value: number | string;
  target?: number | string;
  progress?: number;
  status: 'exceeds' | 'on_track' | 'needs_attention' | 'critical';
  trend?: string;
  chart?: React.ReactNode;
  permission: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title, value, target, progress, status, trend, chart, permission
}) => {
  if (!permission) {
    return <LockedKPI title={title} />;
  }
  
  return (
    <Card className={`kpi-card status-${status}`}>
      <CardHeader>
        <h3>{title}</h3>
        <StatusBadge status={status} />
      </CardHeader>
      <CardBody>
        <div className="value">{value}</div>
        {target && <div className="target">Target: {target}</div>}
        {progress && <ProgressBar value={progress} />}
        {trend && <div className="trend">{trend}</div>}
        {chart && <div className="chart">{chart}</div>}
      </CardBody>
    </Card>
  );
};
```

## 🔐 Permission System

### Permission Keys

```python
# Global KPI permissions
"kpis.view_all"          # View all KPIs
"kpis.create"            # Create new KPI definitions
"kpis.edit_targets"      # Set KPI targets
"kpis.delete"            # Delete KPI definitions

# Category-specific permissions
"kpis.sales.view"        # View sales KPIs
"kpis.marketing.view"    # View marketing KPIs
"kpis.operations.view"   # View operations KPIs
"kpis.finance.view"      # View finance KPIs

# Individual KPI permissions (stored in kpi_permissions table)
# Managed per-KPI for granular control
```

## 📈 Automated Sync Schedule

```python
# Daily KPI sync (runs every hour)
@scheduler.scheduled_job('cron', hour='*/1')
async def sync_daily_kpis():
    kpis = get_daily_kpis()
    for kpi in kpis:
        value = calculate_kpi_value(kpi, datetime.now().date())
        store_kpi_value(kpi.id, value)
        check_alerts(kpi.id, value)

# Weekly KPI sync (runs Monday morning)
@scheduler.scheduled_job('cron', day_of_week='mon', hour=6)
async def sync_weekly_kpis():
    kpis = get_weekly_kpis()
    for kpi in kpis:
        value = calculate_weekly_kpi(kpi)
        store_kpi_value(kpi.id, value)
        check_alerts(kpi.id, value)

# Monthly KPI sync (runs 1st of month)
@scheduler.scheduled_job('cron', day=1, hour=7)
async def sync_monthly_kpis():
    kpis = get_monthly_kpis()
    for kpi in kpis:
        value = calculate_monthly_kpi(kpi)
        store_kpi_value(kpi.id, value)
        check_alerts(kpi.id, value)
```

## 💡 Best Practices

1. **Start with essential KPIs** - Don't track everything, focus on what matters
2. **Set realistic targets** - Based on historical data and growth goals
3. **Review regularly** - Daily standup for daily KPIs, weekly review for weekly KPIs
4. **Automate data collection** - Minimize manual entry
5. **Make KPIs visible** - Display on dashboards, share in meetings
6. **Act on insights** - KPIs should drive decisions and actions
7. **Adjust as needed** - KPIs should evolve with your business

## 🚀 Getting Started

1. **Define your KPIs** - Choose 3-5 KPIs per category to start
2. **Set up data sources** - Connect to databases, APIs, Google Sheets
3. **Configure targets** - Set realistic, achievable targets
4. **Set up alerts** - Get notified when KPIs need attention
5. **Build dashboards** - Create visual displays for each time period
6. **Train your team** - Ensure everyone understands the KPIs
7. **Review and iterate** - Continuously improve your KPI system

## 📊 Example KPI Configuration

```json
{
  "name": "Daily Sales Calls",
  "description": "Number of outbound sales calls made by the team",
  "category": "sales",
  "tracking_period": "daily",
  "unit": "number",
  "calculation_method": "count",
  "data_source": "crm_api",
  "target": {
    "value": 50,
    "period": "daily"
  },
  "alerts": [
    {
      "type": "below_target",
      "threshold": 20,
      "channels": ["email", "slack"]
    }
  ],
  "permissions": {
    "view": ["ceo", "sales_manager", "sales_rep"],
    "edit": ["ceo", "sales_manager"]
  }
}
```
