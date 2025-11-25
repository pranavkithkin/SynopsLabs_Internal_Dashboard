# Dashboard Issues Found & Solutions

## 🔍 Issues Identified

### 1. **Duplicate Header Rows** ❌
When you imported the CSV files, the header row was also imported as data. This breaks all calculations.

**Evidence:**
- First expense shows: `"Date": "Date"` (should be a real date)
- First project shows: `"Client_Name": "Client_Name"` (should be a company name)

### 2. **Date Mismatch** ❌
Sample data had 2024 dates, but current date is **2025-11-24**, so:
- CAC calculation finds 0 expenses in November 2025
- QVC calculation finds 0 projects in Q4 2025

### 3. **Charts Not Showing** ❌
Because CAC and QVC are 0, the charts have no data to display.

### 4. **Ratios Incorrect** ❌
CAC:LTV shows "0:1 Critical" because CAC = 0

---

## ✅ Solutions Created

### 1. Updated CSV Files
I've updated all 4 CSV files with **2025 dates**:
- ✅ `sample_data_customers.csv` - Dates now in 2025
- ✅ `sample_data_expenses.csv` - Nov/Oct/Sep 2025
- ✅ `sample_data_projects.csv` - Q4 2025 completions
- ✅ `sample_data_snapshots.csv` - 2025 monthly data

### 2. Fix Instructions
Created `FIX_GOOGLE_SHEET_DATA.md` with step-by-step instructions.

---

## 🚀 Quick Fix (Choose One)

### Option A: Re-import (Cleanest)
1. **Delete all data rows** from your Google Sheet (keep Row 1 headers)
2. **Re-import updated CSV files** (File → Import → Append rows)
3. **Verify Row 2** has real data, not headers
4. **Restart backend**

### Option B: Manual Fix (Faster)
1. **Delete Row 2** from each of the 4 tabs (the duplicate header row)
2. **Find & Replace** in Google Sheets: `2024-` → `2025-`
3. **Restart backend**

---

## 🧪 After Fixing - Test Commands

```bash
# Test CAC (should be ~1,862, not 0)
curl http://localhost:8000/api/metrics/cac

# Test QVC (should be ~170,000, not 0)
curl http://localhost:8000/api/metrics/qvc

# Test MRR history (should not have "Date" as first entry)
curl http://localhost:8000/api/metrics/mrr/history
```

---

## 📊 Expected Results After Fix

- **MRR:** AED 37,300 ✅ (already working)
- **CAC:** AED 1,862 (currently 0)
- **LTV:** AED 82,889 ✅ (already working)
- **QVC:** AED 170,000 (currently 0)
- **LTGP:** AED 621,600 ✅ (already working)

**Charts:** Should display sparklines and trends  
**Compare:** CAC and QVC should show values  
**Ratios:** CAC:LTV should show ~1:44 (Healthy)

---

## 📁 Files to Use

All in your project root:
- `sample_data_customers.csv` ← Updated with 2025 dates
- `sample_data_expenses.csv` ← Updated with 2025 dates
- `sample_data_projects.csv` ← Updated with 2025 dates
- `sample_data_snapshots.csv` ← Updated with 2025 dates
- `FIX_GOOGLE_SHEET_DATA.md` ← Detailed instructions
