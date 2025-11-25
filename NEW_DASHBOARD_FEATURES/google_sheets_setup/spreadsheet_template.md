# Google Sheets Template Setup

## 📊 Quick Reference

This document provides the exact structure for your Google Sheets spreadsheet.

## 📋 Spreadsheet Name
`TRART Business Metrics Data`

## 📑 Required Sheets

### Sheet 1: Customers

**Sheet Name**: `Customers`

**Column Headers** (Row 1):
```
A: Customer Name
B: Setup Fee
C: MRR
D: Start Date
E: Industry
F: Status
G: Plan Duration
H: Notes
```

**Data Validation**:
- Column F (Status): Dropdown → `Active`, `Churned`
- Column D (Start Date): Date format → `YYYY-MM-DD`
- Columns B, C, G: Number format

**Sample Data** (Rows 2-4):
```
Acme Corp       | 5000  | 2500 | 2024-01-15 | Technology | Active  | 12 | Annual contract
Beta Inc        | 3000  | 1500 | 2024-02-01 | Finance    | Active  | 12 | 
Gamma Solutions | 4000  | 2000 | 2024-03-10 | Retail     | Active  | 12 | 
```

---

### Sheet 2: Expenses

**Sheet Name**: `Expenses`

**Column Headers** (Row 1):
```
A: Date
B: Category
C: Amount
D: Description
E: Added By
```

**Data Validation**:
- Column B (Category): Dropdown → `Marketing`, `Sales Cost`, `Operations`, `Other`
- Column A (Date): Date format → `YYYY-MM-DD`
- Column C (Amount): Number format

**Sample Data** (Rows 2-4):
```
2024-11-01 | Marketing   | 5000 | Google Ads campaign      | Pranav
2024-11-05 | Sales Cost  | 2000 | CRM subscription         | Fazil
2024-11-10 | Marketing   | 3000 | LinkedIn ads             | Thameem
```

---

### Sheet 3: Projects

**Sheet Name**: `Projects`

**Column Headers** (Row 1):
```
A: Client Name
B: Project Name
C: Completion Date
D: Documentation Link
E: Value Type
F: Value Amount
G: Calculated By
H: Notes
```

**Data Validation**:
- Column E (Value Type): Dropdown → `Cost Savings`, `Revenue Increase`, `Time Savings`, `Strategic`
- Column C (Completion Date): Date format → `YYYY-MM-DD`
- Column F (Value Amount): Number format

**Sample Data** (Rows 2-3):
```
Acme Corp | Dashboard Redesign  | 2024-10-15 | https://docs.../proj1 | Revenue Increase | 50000 | Client Report | Increased conversions
Beta Inc  | Process Automation  | 2024-11-01 | https://docs.../proj2 | Cost Savings     | 30000 | Time Study    | Saved 500 hours/month
```

---

### Sheet 4: Strategic

**Sheet Name**: `Strategic`

**Column Headers** (Row 1):
```
A: Metric Name
B: Value
C: Unit
D: Notes
```

**Required Metrics** (Rows 2-6):
```
TAM (Total Market)         | 10000000000 | USD     | Global market size
SAM (Serviceable Market)   | 500000000   | USD     | Realistic addressable market
Current Annual Revenue     | 2000000     | USD     | Last 12 months
Growth Probability         | 0.75        | Decimal | 75% confidence
Target Market Share        | 0.05        | Decimal | 5% target
```

---

## 🎨 Formatting Tips

### Conditional Formatting

**Customers Sheet**:
- Highlight churned customers in red:
  - Apply to: Column F
  - Format cells if: Text is exactly "Churned"
  - Background: Red

**Expenses Sheet**:
- Highlight high expenses (>$5000) in yellow:
  - Apply to: Column C
  - Format cells if: Greater than 5000
  - Background: Yellow

**Projects Sheet**:
- Highlight high-value projects (>$40000) in green:
  - Apply to: Column F
  - Format cells if: Greater than 40000
  - Background: Green

### Number Formatting

- Currency columns: Format → Number → Currency → USD
- Percentage columns: Format → Number → Percent
- Date columns: Format → Number → Date → YYYY-MM-DD

---

## 🔧 Setup Checklist

- [ ] Create new Google Spreadsheet
- [ ] Rename to "TRART Business Metrics Data"
- [ ] Create Sheet 1: "Customers"
- [ ] Add Customers column headers
- [ ] Add Customers data validation
- [ ] Add sample customer data
- [ ] Create Sheet 2: "Expenses"
- [ ] Add Expenses column headers
- [ ] Add Expenses data validation
- [ ] Add sample expense data
- [ ] Create Sheet 3: "Projects"
- [ ] Add Projects column headers
- [ ] Add Projects data validation
- [ ] Add sample project data
- [ ] Create Sheet 4: "Strategic"
- [ ] Add Strategic column headers
- [ ] Add strategic metrics data
- [ ] Apply conditional formatting
- [ ] Apply number formatting
- [ ] Share with service account
- [ ] Copy Spreadsheet ID
- [ ] Test connection

---

## 📝 Quick Copy Template

Use this for quick setup:

### Customers Headers
```
Customer Name	Setup Fee	MRR	Start Date	Industry	Status	Plan Duration	Notes
```

### Expenses Headers
```
Date	Category	Amount	Description	Added By
```

### Projects Headers
```
Client Name	Project Name	Completion Date	Documentation Link	Value Type	Value Amount	Calculated By	Notes
```

### Strategic Headers
```
Metric Name	Value	Unit	Notes
```

---

## 🚀 After Setup

1. Copy the Spreadsheet ID from the URL
2. Share with service account email
3. Update `.env` file with Spreadsheet ID
4. Run test connection script
5. Start adding real data!
