# Google Sheet Structure Guide

This guide explains the exact structure your Google Sheet needs to integrate with the Synops Labs Dashboard.

## 📋 Required Tabs

Your Google Sheet must have the following **4 tabs** (exact names):

1. **Customers** - Customer and subscription data
2. **Expenses** - Company expenses tracking
3. **Projects** - Project value tracking
4. **Monthly_Snapshots** - Historical monthly metrics

---

## 1️⃣ Customers Tab

### Headers (Row 1)
Place these headers in **columns A through I**:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Customer_Name | Status | Start_Date | MRR | Previous_Month_Revenue | Plan_Duration | Setup_Fee | Industry | Notes |

### Column Details

- **Customer_Name** (Text): Name of the customer/company
- **Status** (Text): Must be either `Active` or `Churned`
- **Start_Date** (Date): Format: `YYYY-MM-DD` or `MM/DD/YYYY`
- **MRR** (Number): Monthly Recurring Revenue (no currency symbols, commas optional)
- **Previous_Month_Revenue** (Number): Last month's MRR for this customer
- **Plan_Duration** (Number): Contract length in months (e.g., 12, 24, 36)
- **Setup_Fee** (Number): One-time setup fee charged
- **Industry** (Text): Customer's industry
- **Notes** (Text): Any additional notes

### Sample Data

```
Customer_Name          | Status  | Start_Date | MRR    | Previous_Month_Revenue | Plan_Duration | Setup_Fee | Industry    | Notes
Acme Corp             | Active  | 2024-01-15 | 5000   | 4800                  | 12           | 2000      | Technology  | Enterprise client
Beta Solutions        | Active  | 2024-03-01 | 3500   | 3500                  | 24           | 1500      | Finance     | Annual contract
Gamma Industries      | Churned | 2023-06-10 | 0      | 2000                  | 12           | 1000      | Manufacturing| Churned Q3 2024
Delta Services        | Active  | 2024-05-20 | 7500   | 7200                  | 36           | 5000      | Healthcare  | Growing account
```

---

## 2️⃣ Expenses Tab

### Headers (Row 1)
Place these headers in **columns A through E**:

| A | B | C | D | E |
|---|---|---|---|---|
| Date | Category | Description | Amount | Payment_Method |

### Column Details

- **Date** (Date): Format: `YYYY-MM-DD` or `MM/DD/YYYY`
- **Category** (Text): One of:
  - `Marketing`
  - `Sales cost`
  - `Advertising`
  - `AI/API Costs`
  - `Salaries`
  - `Office`
  - `Software`
  - `Other`
- **Description** (Text): What the expense was for
- **Amount** (Number): Expense amount (no currency symbols)
- **Payment_Method** (Text): How it was paid (optional)

### Sample Data

```
Date       | Category      | Description              | Amount | Payment_Method
2024-11-01 | Marketing     | Google Ads Campaign      | 2500   | Credit Card
2024-11-05 | AI/API Costs  | OpenAI API Usage         | 450    | Auto-debit
2024-11-10 | Salaries      | Developer Salaries       | 15000  | Bank Transfer
2024-11-15 | Software      | GitHub Enterprise        | 200    | Credit Card
2024-11-20 | Advertising   | LinkedIn Ads             | 1800   | Credit Card
```

---

## 3️⃣ Projects Tab

### Headers (Row 1)
Place these headers in **columns A through I**:

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Project_Name | Client | Start_Date | Completion_Date | Status | Value_Amount | Team_Size | Project_Type | Notes |

### Column Details

- **Project_Name** (Text): Name of the project
- **Client** (Text): Client name (should match Customer_Name)
- **Start_Date** (Date): Format: `YYYY-MM-DD` or `MM/DD/YYYY`
- **Completion_Date** (Date): When project was completed
- **Status** (Text): `Completed`, `In Progress`, or `Planned`
- **Value_Amount** (Number): Total project value
- **Team_Size** (Number): Number of team members
- **Project_Type** (Text): Type of project
- **Notes** (Text): Additional information

### Sample Data

```
Project_Name           | Client          | Start_Date | Completion_Date | Status     | Value_Amount | Team_Size | Project_Type      | Notes
Dashboard Development  | Acme Corp       | 2024-10-01 | 2024-11-15     | Completed  | 25000       | 3         | Software Dev      | Q4 delivery
AI Integration        | Beta Solutions  | 2024-09-01 | 2024-10-30     | Completed  | 18000       | 2         | AI/ML             | Phase 1 complete
Mobile App            | Delta Services  | 2024-11-01 | 2025-01-15     | In Progress| 45000       | 5         | Mobile Dev        | iOS & Android
```

---

## 4️⃣ Monthly_Snapshots Tab

### Headers (Row 1)
Place these headers in **columns A through H**:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Month | MRR | Active_Customers | New_Customers | Churned_Customers | Total_Expenses | Marketing_Spend | Net_New_ARR |

### Column Details

- **Month** (Text): Format: `YYYY-MM` (e.g., `2024-11`)
- **MRR** (Number): Total MRR for that month
- **Active_Customers** (Number): Count of active customers
- **New_Customers** (Number): New customers acquired
- **Churned_Customers** (Number): Customers lost
- **Total_Expenses** (Number): All expenses for the month
- **Marketing_Spend** (Number): Marketing expenses only
- **Net_New_ARR** (Number): New ARR minus churned ARR

### Sample Data

```
Month   | MRR    | Active_Customers | New_Customers | Churned_Customers | Total_Expenses | Marketing_Spend | Net_New_ARR
2024-08 | 45000  | 12              | 2            | 0                | 18000         | 3500           | 24000
2024-09 | 52000  | 14              | 3            | 1                | 19500         | 4200           | 30000
2024-10 | 61000  | 16              | 3            | 1                | 21000         | 4800           | 36000
2024-11 | 68500  | 18              | 4            | 2                | 22500         | 5500           | 42000
```

---

## 🔧 Setup Instructions

1. **Create a new Google Sheet** or use existing one
2. **Create 4 tabs** with exact names: `Customers`, `Expenses`, `Projects`, `Monthly_Snapshots`
3. **Add headers** in Row 1 for each tab (as shown above)
4. **Add your data** starting from Row 2
5. **Share the sheet** with your service account email:
   - Find in `.env`: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - Share with **Viewer** access
6. **Copy the Spreadsheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
   - Add to `.env` as `GOOGLE_SHEETS_ID`

---

## ✅ Data Validation Tips

- **Dates**: Use consistent format (recommended: `YYYY-MM-DD`)
- **Numbers**: No currency symbols ($, €, etc.)
- **Status values**: Use exact text (`Active`, `Churned`, `Completed`, etc.)
- **Empty cells**: Leave blank, don't use "N/A" or "-"
- **Commas in numbers**: Optional (e.g., `5000` or `5,000` both work)

---

## 🧪 Testing Your Sheet

After setup, test the integration:

```bash
# Check if backend can read your sheet
curl http://localhost:8000/api/metrics/mrr
```

You should see a JSON response with your MRR data.
