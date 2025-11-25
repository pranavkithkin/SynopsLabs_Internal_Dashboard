# How to Import Sample Data into Google Sheets

I've created 4 CSV files with sample data. Here are **two easy methods** to import them:

---

## ✅ Method 1: Import CSV Files (Recommended)

### For Each Tab:

1. **Open your Google Sheet**
2. **Click on the tab** you want to add data to (Customers, Expenses, Projects, or Monthly_Snapshots)
3. **Go to:** File → Import
4. **Click:** Upload tab
5. **Drag and drop** the corresponding CSV file:
   - `sample_data_customers.csv` → Customers tab
   - `sample_data_expenses.csv` → Expenses tab
   - `sample_data_projects.csv` → Projects tab
   - `sample_data_snapshots.csv` → Monthly_Snapshots tab
6. **Import settings:**
   - Import location: **"Append rows to current sheet"**
   - Separator type: **"Detect automatically"** (or select Comma)
   - Convert text to numbers: **Yes**
7. **Click:** Import data

**Repeat for all 4 tabs.**

---

## ✅ Method 2: Open CSV and Copy

### For Each Tab:

1. **Double-click** the CSV file to open it (it will open in Excel, Numbers, or Google Sheets)
2. **Select all data rows** (NOT the header, just rows 2 onwards)
3. **Copy** (Cmd+C)
4. **Go to your Google Sheet**
5. **Click on the appropriate tab**
6. **Click cell A2** (first cell below your headers)
7. **Paste** (Cmd+V)

**Repeat for all 4 tabs.**

---

## 📁 CSV Files Created

- ✅ `sample_data_customers.csv` - 10 customers
- ✅ `sample_data_expenses.csv` - 20 expenses
- ✅ `sample_data_projects.csv` - 10 projects
- ✅ `sample_data_snapshots.csv` - 6 months of history

All files are in your project root directory:
```
/Users/pranav/MY_PROJECTS/.../0004_Dashboard/
```

---

## 🔄 After Importing

### 1. Restart Backend (to clear cache)

In your terminal running the backend, press **Ctrl+C**, then:

```bash
source backend/venv/bin/activate && cd backend && uvicorn main:app --reload
```

### 2. Test the Metrics

```bash
curl http://localhost:8000/api/metrics/mrr
curl http://localhost:8000/api/metrics/cac
curl http://localhost:8000/api/metrics/ltv
curl http://localhost:8000/api/metrics/qvc
curl http://localhost:8000/api/metrics/ltgp
```

### 3. Check Dashboard

Open http://localhost:3000 and verify all metrics display correctly.

---

## 📊 Expected Results

After importing all data:

- **MRR:** ~40,300 (up from 500)
- **Active Customers:** 14 total
- **CAC:** ~1,862
- **LTV:** ~129,600
- **QVC (Q4 2024):** ~170,000
- **LTGP:** ~1,088,640

---

## 🐛 Troubleshooting

### If import fails:
- Make sure you're selecting "Append rows" not "Replace"
- Check that your headers in the sheet match the CSV headers exactly
- Try Method 2 (open and copy) instead

### If metrics don't update:
- Wait 5 minutes for cache to expire
- Or restart the backend server
- Check backend logs for errors

### If values look wrong:
- Verify dates are in YYYY-MM-DD format
- Ensure Status values are exactly "Active" or "Churned"
- Check that numeric fields don't have text

---

## 💡 Pro Tip

After importing, you can delete the CSV files if you want:
```bash
rm sample_data_*.csv
```

Or keep them as backup/reference!
