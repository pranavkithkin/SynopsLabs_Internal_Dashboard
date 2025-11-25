# Metrics Calculations Guide

This document explains how each metric is calculated from your Google Sheets data.

---

## 📊 Core Metrics

### 1. MRR (Monthly Recurring Revenue)

**Formula:**
```
MRR = SUM(MRR for all customers where Status = "Active")
```

**Change Calculation:**
```
Previous MRR = SUM(Previous_Month_Revenue for all active customers)
Change % = ((Current MRR - Previous MRR) / Previous MRR) × 100
```

**Data Source:** `Customers` tab
- Current: Column D (MRR)
- Previous: Column E (Previous_Month_Revenue)
- Filter: Column B (Status = "Active")

**Example:**
- Active Customer 1: MRR = $5,000
- Active Customer 2: MRR = $3,500
- Active Customer 3: MRR = $7,500
- **Total MRR = $16,000**

---

### 2. CAC (Customer Acquisition Cost)

**Formula:**
```
CAC = Total Marketing Spend This Month / New Customers This Month
```

**Marketing Spend:**
```
Sum of expenses where:
- Category = "Marketing" OR "Sales cost" OR "Advertising"
- Date is within current month
```

**New Customers:**
```
Count of customers where:
- Start_Date is within current month
```

**Data Sources:**
- `Expenses` tab (Categories: Marketing, Sales cost, Advertising)
- `Customers` tab (Start_Date)

**Example:**
- Marketing Spend: $2,500 + $1,800 = $4,300
- New Customers: 2
- **CAC = $4,300 / 2 = $2,150**

---

### 3. LTV (Lifetime Value)

**Formula:**
```
LTV = Average MRR × Average Plan Duration
```

**Calculation Steps:**
1. Get all active customers with MRR > 0
2. Calculate average MRR
3. Calculate average Plan Duration (in months)
4. Multiply them

**Data Source:** `Customers` tab
- Column D (MRR)
- Column F (Plan_Duration)
- Filter: Status = "Active"

**Example:**
- Customer 1: MRR = $5,000, Duration = 12 months
- Customer 2: MRR = $3,500, Duration = 24 months
- Customer 3: MRR = $7,500, Duration = 36 months
- Average MRR = ($5,000 + $3,500 + $7,500) / 3 = $5,333
- Average Duration = (12 + 24 + 36) / 3 = 24 months
- **LTV = $5,333 × 24 = $128,000**

---

### 4. QVC (Quarterly Value Created)

**Formula:**
```
QVC = SUM(Value_Amount for projects completed this quarter)
```

**Quarter Definitions:**
- Q1: January - March
- Q2: April - June
- Q3: July - September
- Q4: October - December

**Data Source:** `Projects` tab
- Column F (Value_Amount)
- Filter: Completion_Date within current quarter

**Example (Q4 2024):**
- Project 1 completed Nov 15: $25,000
- Project 2 completed Oct 30: $18,000
- **QVC = $43,000**

---

### 5. LTGP (Lifetime Gross Profit)

**Formula:**
```
LTGP = Total Lifetime Revenue × Gross Margin
Total Lifetime Revenue = SUM(MRR × Plan_Duration for all active customers)
Gross Margin = 70% (assumed for service business)
```

**Calculation Steps:**
1. For each active customer: MRR × Plan_Duration
2. Sum all lifetime revenues
3. Multiply by 0.70 (70% margin)

**Data Source:** `Customers` tab
- Column D (MRR)
- Column F (Plan_Duration)
- Filter: Status = "Active"

**Example:**
- Customer 1: $5,000 × 12 = $60,000
- Customer 2: $3,500 × 24 = $84,000
- Customer 3: $7,500 × 36 = $270,000
- Total Lifetime Revenue = $414,000
- **LTGP = $414,000 × 0.70 = $289,800**

---

## 📈 KPI Metrics

### 6. NRR (Net Revenue Retention)

**Formula:**
```
NRR = (Current MRR from existing customers / Previous Month MRR) × 100
```

**Calculation:**
- Only includes customers who existed last month
- Accounts for expansions and contractions
- Does NOT include new customers

**Data Source:** `Customers` tab
- Current: Column D (MRR)
- Previous: Column E (Previous_Month_Revenue)
- Filter: Status = "Active" AND Previous_Month_Revenue > 0

**Example:**
- Existing customers' current MRR: $18,000
- Same customers' previous MRR: $17,000
- **NRR = ($18,000 / $17,000) × 100 = 105.9%**

**Interpretation:**
- NRR > 100%: Revenue growing from existing customers (expansion)
- NRR = 100%: Flat revenue
- NRR < 100%: Revenue declining (contraction/churn)

---

### 7. Gross Margin

**Formula:**
```
Gross Margin = ((Annual Revenue - Direct Costs) / Annual Revenue) × 100
Annual Revenue = Total MRR × 12
Direct Costs = AI/API Costs × 12
```

**Data Sources:**
- `Customers` tab: MRR (Column D)
- `Expenses` tab: Category = "AI/API Costs"

**Example:**
- Annual Revenue: $16,000 × 12 = $192,000
- Monthly AI Costs: $450
- Annual AI Costs: $450 × 12 = $5,400
- **Gross Margin = (($192,000 - $5,400) / $192,000) × 100 = 97.2%**

---

### 8. Customer Concentration (Top 3)

**Formula:**
```
Concentration = (MRR of Top 3 Customers / Total MRR) × 100
```

**Calculation Steps:**
1. Get all active customers
2. Sort by MRR (descending)
3. Sum MRR of top 3
4. Divide by total MRR

**Data Source:** `Customers` tab
- Column D (MRR)
- Filter: Status = "Active"

**Example:**
- Top Customer 1: $7,500
- Top Customer 2: $5,000
- Top Customer 3: $3,500
- Top 3 Total: $16,000
- Total MRR: $25,000
- **Concentration = ($16,000 / $25,000) × 100 = 64%**

**Interpretation:**
- < 30%: Low concentration (healthy diversification)
- 30-50%: Moderate concentration
- > 50%: High concentration (risky)

---

## 📅 Time-Based Calculations

### Current Month Range
```
Start: First day of current month at 00:00:00
End: Last day of current month at 23:59:59
```

### Current Quarter Range
```
Q1: Jan 1 - Mar 31
Q2: Apr 1 - Jun 30
Q3: Jul 1 - Sep 30
Q4: Oct 1 - Dec 31
```

### Date Parsing
Supported formats:
- `YYYY-MM-DD` (recommended)
- `MM/DD/YYYY`
- `DD/MM/YYYY`
- `YYYY/MM/DD`

---

## 🔄 Historical Data (Monthly_Snapshots)

The `Monthly_Snapshots` tab stores historical metrics for trend analysis and sparklines.

**Usage:**
- Displays historical trends on dashboard
- Generates sparkline charts
- Tracks month-over-month changes

**Auto-calculated fields** (from other tabs):
- MRR
- Active_Customers
- Total_Expenses

**Manual entry fields:**
- New_Customers
- Churned_Customers
- Marketing_Spend
- Net_New_ARR

---

## 🎯 Trend Indicators

**Trend Logic:**
```
if change_percentage > 0.5:
    trend = "up" (green)
elif change_percentage < -0.5:
    trend = "down" (red)
else:
    trend = "neutral" (gray)
```

**Applied to:**
- MRR
- CAC
- LTV
- QVC
- LTGP

---

## 🧮 Calculation Code Reference

All calculations are implemented in:
```
backend/services/calculations.py
```

Functions:
- `calculate_mrr()` - Lines 48-67
- `calculate_cac()` - Lines 70-105
- `calculate_ltv()` - Lines 108-142
- `calculate_qvc()` - Lines 145-169
- `calculate_ltgp()` - Lines 172-195
- `calculate_nrr()` - Lines 198-215
- `calculate_gross_margin()` - Lines 218-231
- `calculate_customer_concentration()` - Lines 234-251

---

## ⚡ Performance Notes

**Caching:**
- Data is cached for 5 minutes
- Reduces API calls to Google Sheets
- Clear cache: Restart backend server

**Optimization Tips:**
1. Keep sheet size reasonable (< 1000 rows per tab)
2. Use formulas in Google Sheets for derived values
3. Archive old data to separate sheets
4. Update Monthly_Snapshots once per month
