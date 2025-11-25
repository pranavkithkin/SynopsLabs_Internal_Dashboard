# Google Sheets Setup Guide

## 📊 Overview

This guide walks you through setting up Google Sheets integration for automated business metrics calculation. The system uses Google Sheets as a data source and syncs data to calculate MRR, CAC, LTV, QVC, and LTGP.

## 🎯 Prerequisites

- Google Account
- Access to Google Cloud Console
- Basic understanding of spreadsheets

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Dashboard Metrics`
4. Click "Create"

### Step 2: Enable Google Sheets API

1. In Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google Sheets API"
3. Click on it and click "Enable"

### Step 3: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in details:
   - **Service account name**: `metrics-sync-service`
   - **Service account ID**: `metrics-sync` (auto-generated)
   - **Description**: `Service account for syncing metrics from Google Sheets`
4. Click "Create and Continue"
5. Grant role: "Editor" (or create custom role with Sheets access)
6. Click "Continue" → "Done"

### Step 4: Create and Download Credentials

1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Select "JSON" format
5. Click "Create"
6. Save the downloaded JSON file securely
7. Rename it to `google-sheets-credentials.json`

### Step 5: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet
3. Name it: `Business Metrics Data`
4. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

### Step 6: Share Spreadsheet with Service Account

1. Open your spreadsheet
2. Click "Share" button
3. Add the service account email (found in the JSON file):
   ```
   metrics-sync@your-project.iam.gserviceaccount.com
   ```
4. Give it "Editor" access
5. Uncheck "Notify people"
6. Click "Share"

### Step 7: Set Up Spreadsheet Structure

Create 4 sheets with the following structure:

#### Sheet 1: Customers

| Column | Header | Type | Description |
|--------|--------|------|-------------|
| A | Customer Name | Text | Company/customer name |
| B | Setup Fee | Number | One-time setup fee ($) |
| C | MRR | Number | Monthly recurring revenue ($) |
| D | Start Date | Date | Contract start date (YYYY-MM-DD) |
| E | Industry | Text | Customer's industry |
| F | Status | Text | Active/Churned |
| G | Plan Duration | Number | Contract length (months) |
| H | Notes | Text | Additional notes |

**Example Data:**
```
Customer Name    Setup Fee    MRR      Start Date    Industry      Status    Plan Duration    Notes
Acme Corp        5000         2500     2024-01-15    Technology    Active    12               Annual contract
Beta Inc         3000         1500     2024-02-01    Finance       Active    12               
Gamma LLC        4000         2000     2024-03-10    Retail        Churned   6                Cancelled Q3
```

#### Sheet 2: Expenses

| Column | Header | Type | Description |
|--------|--------|------|-------------|
| A | Date | Date | Expense date (YYYY-MM-DD) |
| B | Category | Text | Marketing/Sales Cost/Operations/Other |
| C | Amount | Number | Expense amount ($) |
| D | Description | Text | What the expense was for |
| E | Added By | Text | Who recorded this expense |

**Example Data:**
```
Date          Category      Amount    Description                  Added By
2024-11-01    Marketing     5000      Google Ads campaign          John Doe
2024-11-05    Sales Cost    2000      CRM subscription             Jane Smith
2024-11-10    Marketing     3000      LinkedIn ads                 John Doe
```

#### Sheet 3: Projects

| Column | Header | Type | Description |
|--------|--------|------|-------------|
| A | Client Name | Text | Client company name |
| B | Project Name | Text | Project title |
| C | Completion Date | Date | When project was completed |
| D | Documentation Link | Text | Link to project docs |
| E | Value Type | Text | Cost Savings/Revenue Increase/Time Savings/Strategic |
| F | Value Amount | Number | Quantified value ($) |
| G | Calculated By | Text | How value was determined |
| H | Notes | Text | Additional context |

**Example Data:**
```
Client Name    Project Name           Completion Date    Documentation Link         Value Type         Value Amount    Calculated By    Notes
Acme Corp      Dashboard Redesign     2024-10-15         https://docs.../proj1      Revenue Increase   50000           Client Report    Increased conversions
Beta Inc       Process Automation     2024-11-01         https://docs.../proj2      Cost Savings       30000           Time Study       Saved 500 hours/month
```

#### Sheet 4: Strategic

| Column | Header | Type | Description |
|--------|--------|------|-------------|
| A | Metric Name | Text | Strategic metric name |
| B | Value | Number/Text | Metric value |
| C | Unit | Text | Unit of measurement |
| D | Notes | Text | Additional context |

**Example Data:**
```
Metric Name                      Value         Unit        Notes
TAM (Total Market)               10000000000   USD         Global market size
SAM (Serviceable Market)         500000000     USD         Realistic addressable market
Current Annual Revenue           2000000       USD         Last 12 months
Growth Probability               0.75          Decimal     75% confidence
Target Market Share              0.05          Decimal     5% target
```

### Step 8: Configure Environment Variables

Add to your `.env` file:

```env
# Google Sheets Configuration
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SHEETS_CREDENTIALS_PATH=/path/to/google-sheets-credentials.json
```

**Example:**
```env
GOOGLE_SHEETS_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SHEETS_CREDENTIALS_PATH=/Users/yourname/dashboard/backend/credentials/google-sheets-credentials.json
```

### Step 9: Store Credentials Securely

1. Create a `credentials` directory in your backend:
   ```bash
   mkdir -p backend/credentials
   ```

2. Move the JSON file there:
   ```bash
   mv ~/Downloads/google-sheets-credentials.json backend/credentials/
   ```

3. Add to `.gitignore`:
   ```
   backend/credentials/
   *.json
   ```

4. Set proper permissions:
   ```bash
   chmod 600 backend/credentials/google-sheets-credentials.json
   ```

### Step 10: Test Connection

Run the test script:

```python
# test_sheets_connection.py
from services.sheets_service import sheets_service

# Test reading customers
customers = sheets_service.sync_customers()
print(f"Found {len(customers)} customers")

# Test reading expenses
expenses = sheets_service.sync_expenses()
print(f"Found {len(expenses)} expenses")

# Test reading projects
projects = sheets_service.sync_projects()
print(f"Found {len(projects)} projects")

# Test reading strategic data
strategic = sheets_service.sync_strategic()
print(f"Strategic data: {strategic}")
```

Run it:
```bash
python backend/test_sheets_connection.py
```

Expected output:
```
Found 3 customers
Found 5 expenses
Found 2 projects
Strategic data: {'TAM (Total Market)': 10000000000, ...}
```

## 📊 Spreadsheet Templates

### Quick Setup Template

Use this Google Sheets template for quick setup:

1. Make a copy of the template: [Business Metrics Template](https://docs.google.com/spreadsheets/d/TEMPLATE_ID/copy)
2. Follow steps 6-10 above

### Manual Setup Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google Sheets API
- [ ] Created service account
- [ ] Downloaded credentials JSON
- [ ] Created spreadsheet
- [ ] Shared spreadsheet with service account
- [ ] Set up 4 sheets (Customers, Expenses, Projects, Strategic)
- [ ] Added column headers
- [ ] Added sample data
- [ ] Configured environment variables
- [ ] Tested connection

## 🔄 Data Sync Schedule

The system automatically syncs data from Google Sheets:

```python
# Daily sync at midnight
@scheduler.scheduled_job('cron', hour=0, minute=0)
async def daily_sync():
    # Sync all sheets
    customers = sheets_service.sync_customers()
    expenses = sheets_service.sync_expenses()
    projects = sheets_service.sync_projects()
    strategic = sheets_service.sync_strategic()
    
    # Calculate metrics
    mrr = metrics_calculator.calculate_mrr(customers)
    cac = metrics_calculator.calculate_cac(expenses, customers)
    ltv = metrics_calculator.calculate_ltv(customers)
    qvc = metrics_calculator.calculate_qvc(projects)
    ltgp = metrics_calculator.calculate_ltgp(strategic, mrr['current'])
    
    # Store in database
    await store_metrics(mrr, cac, ltv, qvc, ltgp)
```

## 💡 Best Practices

### Data Entry

1. **Use consistent date format**: YYYY-MM-DD
2. **Validate numbers**: No commas, just numbers
3. **Use dropdowns**: For Status, Category, Value Type fields
4. **Add notes**: Document important changes
5. **Regular updates**: Update data daily/weekly

### Data Validation

Add data validation in Google Sheets:

1. **Status column**: Dropdown with "Active", "Churned"
2. **Category column**: Dropdown with "Marketing", "Sales Cost", "Operations", "Other"
3. **Value Type column**: Dropdown with "Cost Savings", "Revenue Increase", "Time Savings", "Strategic"
4. **Date columns**: Date format validation
5. **Number columns**: Number format validation

### Security

1. **Limit access**: Only share with necessary people
2. **Use service account**: Don't use personal Google account
3. **Rotate credentials**: Change credentials periodically
4. **Monitor access**: Check access logs regularly
5. **Backup data**: Export spreadsheet regularly

## 🐛 Troubleshooting

### Error: "Credentials not found"

**Solution:**
- Check `GOOGLE_SHEETS_CREDENTIALS_PATH` in `.env`
- Verify file exists at that path
- Check file permissions

### Error: "Spreadsheet not found"

**Solution:**
- Verify `GOOGLE_SHEETS_ID` in `.env`
- Check if spreadsheet is shared with service account
- Confirm service account email in spreadsheet sharing settings

### Error: "Permission denied"

**Solution:**
- Share spreadsheet with service account email
- Give "Editor" access (not just "Viewer")
- Check service account has Sheets API enabled

### Error: "Invalid data format"

**Solution:**
- Check date format is YYYY-MM-DD
- Ensure numbers don't have commas
- Verify column headers match exactly
- Check for empty required fields

### Data not syncing

**Solution:**
- Check sync schedule is running
- Verify credentials are valid
- Check backend logs for errors
- Test connection manually

## 📈 Advanced Features

### Formulas in Sheets

You can add calculated columns:

```
# In Customers sheet, add column I for LTV
=C2*G2

# In Expenses sheet, add column F for running total
=SUM($C$2:C2)
```

### Conditional Formatting

Highlight important data:

1. **Churned customers**: Red background
2. **High-value customers**: Green background
3. **Overdue invoices**: Yellow background

### Charts in Sheets

Create charts for visualization:

1. **MRR over time**: Line chart
2. **Customer distribution**: Pie chart
3. **Expense breakdown**: Bar chart

### Multiple Spreadsheets

For larger organizations, use separate spreadsheets:

```env
GOOGLE_SHEETS_CUSTOMERS_ID=spreadsheet_1_id
GOOGLE_SHEETS_EXPENSES_ID=spreadsheet_2_id
GOOGLE_SHEETS_PROJECTS_ID=spreadsheet_3_id
```

## 🚀 Next Steps

1. ✅ Complete Google Sheets setup
2. ✅ Add sample data
3. ✅ Test connection
4. ⏭️ Configure metrics calculation
5. ⏭️ Set up automated sync
6. ⏭️ Integrate with dashboard
7. ⏭️ Train team on data entry

## 📚 Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Account Guide](https://cloud.google.com/iam/docs/service-accounts)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Sheets API Python Quickstart](https://developers.google.com/sheets/api/quickstart/python)
