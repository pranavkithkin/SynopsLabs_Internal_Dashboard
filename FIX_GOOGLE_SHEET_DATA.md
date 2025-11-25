# 🔧 FIX REQUIRED: Delete Header Rows from Google Sheet

## ⚠️ Problem Found

When you imported the CSV files, the **header row was also imported as data**. This is breaking the calculations!

You need to delete the header rows that were imported as data.

---

## 🛠️ Quick Fix Steps

### For EACH of the 4 tabs (Customers, Expenses, Projects, Monthly_Snapshots):

1. **Open your Google Sheet**
2. **Go to the tab** (e.g., Customers)
3. **Look at Row 2** - Does it say the column names? (e.g., "Customer_Name", "Status", etc.)
4. **If YES:** Right-click on row number 2 → **Delete row**
5. **Repeat** for all 4 tabs

### Example:
If your Customers tab looks like this:
```
Row 1: Customer_Name | Status | Start_Date | ...  ← KEEP (this is your header)
Row 2: Customer_Name | Status | Start_Date | ...  ← DELETE (this is duplicate header from CSV)
Row 3: Test Corp | Active | 2025-11-22 | ...     ← KEEP (this is real data)
Row 4: Acme Corporation | Active | 2025-01-15 | ... ← KEEP (this is real data)
```

You need to **delete Row 2** (the duplicate header).

---

## 📅 Also: Updated CSV Files with 2025 Dates

I've updated all CSV files with **2025 dates** (instead of 2024) to match the current year.

### Steps to Re-import:

1. **First, delete ALL data rows** from your Google Sheet (keep only Row 1 with headers)
2. **Re-import the updated CSV files** using File → Import → Append rows
3. **This time, check "Skip header row"** if that option appears
4. **Verify Row 2** doesn't have duplicate headers

---

## ✅ After Fixing

1. **Restart your backend** to clear cache:
   ```bash
   # Press Ctrl+C in the backend terminal, then:
   source backend/venv/bin/activate && cd backend && uvicorn main:app --reload
   ```

2. **Test the metrics:**
   ```bash
   curl http://localhost:8000/api/metrics/cac
   curl http://localhost:8000/api/metrics/qvc
   ```

3. **Expected results:**
   - **CAC:** ~1,862 (not 0)
   - **QVC:** ~170,000 (not 0)
   - **Charts:** Should display properly
   - **Ratios:** CAC:LTV should show proper ratio

---

## 🎯 What Changed in Updated CSVs

All dates updated from **2024** to **2025**:
- Customers: Start dates now in 2025
- Expenses: Dates now Nov 2025, Oct 2025, etc.
- Projects: Completion dates in Q4 2025
- Snapshots: Monthly data for 2025

This matches the current date: **2025-11-24**

---

## 📝 Quick Checklist

- [ ] Delete duplicate header rows from all 4 tabs
- [ ] Clear all data and re-import updated CSV files
- [ ] Restart backend server
- [ ] Test CAC and QVC endpoints
- [ ] Verify charts display in dashboard
- [ ] Check ratios show correct CAC:LTV

---

## 💡 Alternative: Manual Fix

If you don't want to re-import, you can:

1. **Delete Row 2** from each tab (the duplicate header)
2. **Manually update dates** from 2024 to 2025 in your sheet
   - Find & Replace: `2024-` → `2025-`
3. **Restart backend**

This is faster if you've already imported everything!
