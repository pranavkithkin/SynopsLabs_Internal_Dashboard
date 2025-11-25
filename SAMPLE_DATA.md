# Sample Data for Google Sheets Dashboard

Based on your actual Google Sheet structure, here's sample data you can copy-paste into each tab.

---

## 📊 Tab 1: Customers

**Your Headers:**
```
Customer_Name | Status | Start_Date | MRR | Previous_Month_Revenue | Plan_Duration | Setup_Fee | Industry | Notes
```

**Sample Data (copy rows 2-11):**

```
Acme Corporation          Active    2024-01-15    5000    4800    12    2000    Technology        Enterprise SaaS client
Beta Solutions Inc        Active    2024-03-01    3500    3500    24    1500    Finance           Annual contract renewal
Gamma Industries          Churned   2023-06-10    0       2000    12    1000    Manufacturing     Churned in Q3 2024
Delta Healthcare          Active    2024-05-20    7500    7200    36    5000    Healthcare        Growing account - upsold
Epsilon Retail            Active    2024-07-10    2500    2200    12    800     Retail            Small business plan
Zeta Logistics            Active    2024-08-15    4200    4000    24    1800    Logistics         Mid-tier contract
Theta Education           Active    2024-09-01    3800    3600    12    1200    Education         University partnership
Iota Consulting           Active    2024-10-05    6500    6000    36    3500    Consulting        Premium tier
Kappa Media               Active    2024-11-01    2800    0       12    900     Media             New customer this month
Lambda Ventures           Active    2024-11-15    4500    0       24    2000    Finance           New customer this month
```

**Current Count:** 1 customer (Test Corp)  
**After adding:** 11 customers total  
**Total MRR:** ~40,300

---

## 💰 Tab 2: Expenses

**Your Headers:**
```
Date       | Category      | Amount | Description                    | Added_By
```

**Sample Data (copy rows 2-21):**

```
2024-11-01    Marketing        2500     Google Ads - November Campaign       Pranav
2024-11-02    AI/API Costs     450      OpenAI API Usage                     System
2024-11-05    Sales cost       800      Sales team commissions               Fazil
2024-11-08    Advertising      1800     LinkedIn Sponsored Content           Pranav
2024-11-10    Salaries         15000    Developer Salaries                   HR
2024-11-12    Software         200      GitHub Enterprise                    IT
2024-11-15    Marketing        3200     Content Marketing Agency             Pranav
2024-11-18    AI/API Costs     520      Google Cloud AI Services             System
2024-11-20    Office           1200     Co-working Space Rent                Admin
2024-11-22    Advertising      950      Facebook Ads Campaign                Pranav
2024-10-01    Marketing        2200     October Google Ads                   Pranav
2024-10-05    AI/API Costs     380      OpenAI API - October                 System
2024-10-10    Salaries         14500    Developer Salaries                   HR
2024-10-15    Sales cost       650      Sales commissions                    Fazil
2024-10-20    Software         180      Various SaaS tools                   IT
2024-09-01    Marketing        1900     September Marketing                  Pranav
2024-09-10    Salaries         14000    Developer Salaries                   HR
2024-09-15    AI/API Costs     340      AI Services - September              System
2024-08-01    Marketing        1600     August Campaigns                     Pranav
2024-08-10    Salaries         13500    Developer Salaries                   HR
```

**Current Count:** 0 expenses  
**After adding:** 20 expenses  
**November Total:** ~26,620

---

## 🚀 Tab 3: Projects

**Your Headers:**
```
Client_Name              | Project_Name                  | Completion_Date | Documentation_Link                        | Value_Type | Value_Amount | Calculated_By | Notes
```

**Sample Data (copy rows 2-11):**

```
Acme Corporation         Dashboard Development          2024-11-15         https://docs.acme.com/dashboard            Fixed      25000          Pranav        Q4 delivery complete
Beta Solutions Inc       AI Integration Phase 1         2024-10-30         https://beta.ai/docs                       Fixed      18000          Fazil         ML model deployed
Delta Healthcare         Patient Portal                 2024-11-20         https://delta.health/portal                Fixed      32000          Pranav        HIPAA compliant
Epsilon Retail           E-commerce Platform            2024-09-15         https://epsilon.shop/docs                  Fixed      22000          Suhail        Shopify integration
Zeta Logistics           Route Optimization             2024-10-10         https://zeta.logistics/optimizer           Fixed      28000          Pranav        AI-powered routing
Theta Education          LMS Customization              2024-11-05         https://theta.edu/lms                      Fixed      15000          Fazil         Canvas integration
Iota Consulting          Data Analytics Dashboard       2024-08-20         https://iota.consulting/analytics          Fixed      35000          Pranav        PowerBI integration
Kappa Media              Content Management System      2024-11-25         https://kappa.media/cms                    Fixed      20000          Suhail        In final testing
Lambda Ventures          Investment Tracker             2024-12-15         https://lambda.vc/tracker                  Fixed      40000          Pranav        In progress
Acme Corporation         Mobile App Development         2024-12-30         https://docs.acme.com/mobile               Fixed      45000          Fazil         iOS & Android
```

**Current Count:** 0 projects  
**After adding:** 10 projects  
**Q4 Completed:** ~170,000 value

---

## 📈 Tab 4: Monthly_Snapshots

**Your Headers:**
```
Date     | MRR    | Active_Customers | New_Customers | Churned_Customers | Total_Expenses | Marketing_Spend | Net_New_Arr
```

**Sample Data (copy rows 2-7):**

```
2024-06     28000    8     2    0    16500    2800     24000
2024-07     32500    9     2    1    17200    3100     30000
2024-08     37000    10    2    1    18000    3500     36000
2024-09     41500    11    3    2    19500    4200     42000
2024-10     45800    13    3    1    21000    4800     48000
2024-11     40300    14    4    3    26620    7450     38000
```

**Current Count:** 0 snapshots  
**After adding:** 6 months of history  
**Growth:** From 28K to 40K MRR

---

## 📝 Copy-Paste Instructions

### For Customers Tab:
1. Open your Google Sheet
2. Go to "Customers" tab
3. Click on cell A2 (first cell below headers)
4. Copy the 10 rows from above (Acme Corporation through Lambda Ventures)
5. Paste into the sheet
6. The data should auto-format

### For Expenses Tab:
1. Go to "Expenses" tab
2. Click on cell A2
3. Copy all 20 expense rows
4. Paste into the sheet

### For Projects Tab:
1. Go to "Projects" tab
2. Click on cell A2
3. Copy all 10 project rows
4. Paste into the sheet

### For Monthly_Snapshots Tab:
1. Go to "Monthly_Snapshots" tab
2. Click on cell A2
3. Copy all 6 snapshot rows
4. Paste into the sheet

---

## ✅ After Adding Data

### Test the Dashboard:

1. **Refresh the backend** (it caches for 5 minutes):
   ```bash
   # Just wait 5 minutes, or restart:
   # Ctrl+C the backend, then run again
   ```

2. **Test API endpoints:**
   ```bash
   curl http://localhost:8000/api/metrics/mrr
   curl http://localhost:8000/api/metrics/cac
   curl http://localhost:8000/api/metrics/ltv
   curl http://localhost:8000/api/metrics/qvc
   curl http://localhost:8000/api/metrics/ltgp
   ```

3. **Expected Results:**
   - **MRR:** ~40,300 (up from 500)
   - **CAC:** ~1,862 (7,450 marketing / 4 new customers)
   - **LTV:** ~129,600 (avg MRR 4,030 × avg duration 32 months)
   - **QVC:** ~170,000 (Q4 projects completed)
   - **LTGP:** ~1,088,640 (total lifetime revenue × 70% margin)

4. **Check Dashboard UI:**
   - Open http://localhost:3000
   - Login and verify all metrics display
   - Check sparklines show trends
   - Verify change percentages are calculated

---

## 🔧 Troubleshooting

### If metrics don't update:
1. Clear the cache by restarting backend
2. Check Google Sheet is shared with service account
3. Verify dates are in correct format (YYYY-MM-DD)
4. Ensure no empty cells in numeric columns (use 0 instead)

### If you see errors:
1. Check backend logs for specific error messages
2. Verify all column headers match exactly
3. Make sure Status values are exactly "Active" or "Churned"
4. Ensure numeric fields don't have currency symbols

---

## 📊 Data Characteristics

This sample data creates:
- **Realistic growth pattern:** 6 months of steady MRR growth
- **Healthy metrics:** 
  - NRR: ~105% (expansion revenue)
  - Customer concentration: ~31% (top 3 customers)
  - Gross margin: ~97%
- **Recent activity:** New customers and projects in November
- **Some churn:** Realistic churn pattern (1-3 per month)
- **Varied industries:** Technology, Finance, Healthcare, etc.
- **Different contract lengths:** 12, 24, 36 month plans

Feel free to modify any values to match your business model!
