# Copy-Paste Sample Data for Google Sheets

**Instructions:** 
1. Select the data rows below (excluding the header line)
2. Copy them (Cmd+C)
3. Go to your Google Sheet tab
4. Click on cell A2 (first cell below your headers)
5. Paste (Cmd+V)
6. Google Sheets will automatically separate the columns

---

## 📊 CUSTOMERS TAB

**Copy these 10 rows and paste starting at A2:**

```
Acme Corporation	Active	2024-01-15	5000	4800	12	2000	Technology	Enterprise SaaS client
Beta Solutions Inc	Active	2024-03-01	3500	3500	24	1500	Finance	Annual contract renewal
Gamma Industries	Churned	2023-06-10	0	2000	12	1000	Manufacturing	Churned in Q3 2024
Delta Healthcare	Active	2024-05-20	7500	7200	36	5000	Healthcare	Growing account - upsold
Epsilon Retail	Active	2024-07-10	2500	2200	12	800	Retail	Small business plan
Zeta Logistics	Active	2024-08-15	4200	4000	24	1800	Logistics	Mid-tier contract
Theta Education	Active	2024-09-01	3800	3600	12	1200	Education	University partnership
Iota Consulting	Active	2024-10-05	6500	6000	36	3500	Consulting	Premium tier
Kappa Media	Active	2024-11-01	2800	0	12	900	Media	New customer this month
Lambda Ventures	Active	2024-11-15	4500	0	24	2000	Finance	New customer this month
```

---

## 💰 EXPENSES TAB

**Copy these 20 rows and paste starting at A2:**

```
2024-11-01	Marketing	2500	Google Ads - November Campaign	Pranav
2024-11-02	AI/API Costs	450	OpenAI API Usage	System
2024-11-05	Sales cost	800	Sales team commissions	Fazil
2024-11-08	Advertising	1800	LinkedIn Sponsored Content	Pranav
2024-11-10	Salaries	15000	Developer Salaries	HR
2024-11-12	Software	200	GitHub Enterprise	IT
2024-11-15	Marketing	3200	Content Marketing Agency	Pranav
2024-11-18	AI/API Costs	520	Google Cloud AI Services	System
2024-11-20	Office	1200	Co-working Space Rent	Admin
2024-11-22	Advertising	950	Facebook Ads Campaign	Pranav
2024-10-01	Marketing	2200	October Google Ads	Pranav
2024-10-05	AI/API Costs	380	OpenAI API - October	System
2024-10-10	Salaries	14500	Developer Salaries	HR
2024-10-15	Sales cost	650	Sales commissions	Fazil
2024-10-20	Software	180	Various SaaS tools	IT
2024-09-01	Marketing	1900	September Marketing	Pranav
2024-09-10	Salaries	14000	Developer Salaries	HR
2024-09-15	AI/API Costs	340	AI Services - September	System
2024-08-01	Marketing	1600	August Campaigns	Pranav
2024-08-10	Salaries	13500	Developer Salaries	HR
```

---

## 🚀 PROJECTS TAB

**Copy these 10 rows and paste starting at A2:**

```
Acme Corporation	Dashboard Development	2024-11-15	https://docs.acme.com/dashboard	Fixed	25000	Pranav	Q4 delivery complete
Beta Solutions Inc	AI Integration Phase 1	2024-10-30	https://beta.ai/docs	Fixed	18000	Fazil	ML model deployed
Delta Healthcare	Patient Portal	2024-11-20	https://delta.health/portal	Fixed	32000	Pranav	HIPAA compliant
Epsilon Retail	E-commerce Platform	2024-09-15	https://epsilon.shop/docs	Fixed	22000	Suhail	Shopify integration
Zeta Logistics	Route Optimization	2024-10-10	https://zeta.logistics/optimizer	Fixed	28000	Pranav	AI-powered routing
Theta Education	LMS Customization	2024-11-05	https://theta.edu/lms	Fixed	15000	Fazil	Canvas integration
Iota Consulting	Data Analytics Dashboard	2024-08-20	https://iota.consulting/analytics	Fixed	35000	Pranav	PowerBI integration
Kappa Media	Content Management System	2024-11-25	https://kappa.media/cms	Fixed	20000	Suhail	In final testing
Lambda Ventures	Investment Tracker	2024-12-15	https://lambda.vc/tracker	Fixed	40000	Pranav	In progress
Acme Corporation	Mobile App Development	2024-12-30	https://docs.acme.com/mobile	Fixed	45000	Fazil	iOS & Android
```

---

## 📈 MONTHLY_SNAPSHOTS TAB

**Copy these 6 rows and paste starting at A2:**

```
2024-06	28000	8	2	0	16500	2800	24000
2024-07	32500	9	2	1	17200	3100	30000
2024-08	37000	10	2	1	18000	3500	36000
2024-09	41500	11	3	2	19500	4200	42000
2024-10	45800	13	3	1	21000	4800	48000
2024-11	40300	14	4	3	26620	7450	38000
```

---

## ✅ After Pasting

1. **Wait 5 minutes** for cache to expire, OR restart your backend:
   ```bash
   # In the terminal running the backend, press Ctrl+C, then:
   source backend/venv/bin/activate && cd backend && uvicorn main:app --reload
   ```

2. **Test the metrics:**
   ```bash
   curl http://localhost:8000/api/metrics/mrr
   curl http://localhost:8000/api/metrics/cac
   curl http://localhost:8000/api/metrics/ltv
   curl http://localhost:8000/api/metrics/qvc
   curl http://localhost:8000/api/metrics/ltgp
   ```

3. **Check your dashboard** at http://localhost:3000

---

## 📊 Expected Results After Adding Data

- **MRR:** ~40,300 (currently 500)
- **Active Customers:** 14 (currently 1)
- **CAC:** ~1,862
- **LTV:** ~129,600
- **QVC (Q4):** ~170,000
- **LTGP:** ~1,088,640

---

## 💡 Tips

- The data is **tab-separated** - Google Sheets will automatically split it into columns
- Make sure you're pasting into **row 2** (below headers)
- If columns don't align, check that your headers match exactly
- You can paste all at once or one tab at a time
