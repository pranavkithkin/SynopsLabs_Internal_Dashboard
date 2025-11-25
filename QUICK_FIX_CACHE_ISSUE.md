# Quick Fix: Metrics Showing Zero

## 🐛 Problem
MRR and LTV showing AED 0, but CAC, QVC, and LTGP still working.

## 🔍 Root Cause
**Stale cache in Google Sheets service**

The backend caches Google Sheets data for 5 minutes. The cache expired and is now serving old/empty data.

**Verified:**
- ✅ Google Sheets connection works
- ✅ Customer data loads correctly (10 customers)
- ✅ MRR calculation works (returns 40,300)
- ❌ Cached data is stale/empty

## ✅ Solution

### Option 1: Restart Backend (Recommended)

In your terminal running the backend:

1. **Press `Ctrl+C`** to stop the backend
2. **Run again:**
   ```bash
   source backend/venv/bin/activate && cd backend && uvicorn main:app --reload
   ```
3. **Refresh your dashboard**

### Option 2: Wait 5 Minutes

The cache will automatically refresh after 5 minutes. Just wait and refresh the dashboard.

### Option 3: Clear Cache via Code (Advanced)

Add a cache-clearing endpoint (not currently implemented).

---

## 🔧 Why This Happened

The Google Sheets service caches data for performance:
```python
self._cache_duration = 300  # 5 minutes in seconds
```

When the cache expires, it fetches fresh data. Sometimes the cached data can become stale if:
- The cache expired while the app was idle
- There was a temporary network issue during refresh
- The service restarted but kept old cache in memory

---

## 🛡️ Prevention

To prevent this in the future, you could:

1. **Reduce cache duration** (in `backend/services/sheets.py`):
   ```python
   self._cache_duration = 60  # 1 minute instead of 5
   ```

2. **Add cache-clearing endpoint:**
   ```python
   @app.post("/api/cache/clear")
   async def clear_cache():
       sheets_service.clear_cache()
       return {"status": "cache cleared"}
   ```

3. **Implement cache warming** on startup

---

## ✅ After Restart

You should see:
- MRR: AED 40,300 (+28.8%)
- LTV: AED 95,526 (+0.1%)
- All other metrics working correctly
