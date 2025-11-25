# Google Cloud Setup Guide

This guide walks you through setting up Google Cloud Platform to enable Google Sheets API access for the Synops Labs Dashboard.

---

## 🎯 Overview

You need to:
1. Create a Google Cloud Project
2. Enable Google Sheets API
3. Create a Service Account
4. Generate credentials JSON file
5. Share your Google Sheet with the service account
6. Configure your `.env` file

**Time Required:** ~10 minutes

---

## 📋 Prerequisites

- Google Account (Gmail)
- Access to [Google Cloud Console](https://console.cloud.google.com)
- Your Google Sheet created (see `sheet_setup_guide.md`)

---

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click the project dropdown (top left, next to "Google Cloud")
   - Click **"New Project"**
   - Enter project details:
     - **Project Name:** `Synops Labs Metrics` (or your preferred name)
     - **Organization:** Leave default or select your org
   - Click **"Create"**
   - Wait for project creation (~30 seconds)

3. **Select Your Project**
   - Click the project dropdown again
   - Select your newly created project

---

## Step 2: Enable Google Sheets API

1. **Open API Library**
   - In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or visit: https://console.cloud.google.com/apis/library

2. **Search for Google Sheets API**
   - In the search bar, type: `Google Sheets API`
   - Click on **"Google Sheets API"** from results

3. **Enable the API**
   - Click the blue **"Enable"** button
   - Wait for activation (~10 seconds)

---

## Step 3: Create Service Account

1. **Navigate to Service Accounts**
   - Left sidebar: **"APIs & Services"** → **"Credentials"**
   - Or visit: https://console.cloud.google.com/apis/credentials

2. **Create Service Account**
   - Click **"+ Create Credentials"** (top of page)
   - Select **"Service Account"**

3. **Service Account Details**
   - **Service account name:** `synops-metrics-service`
   - **Service account ID:** Auto-filled (e.g., `synops-metrics-service`)
   - **Description:** `Service account for dashboard metrics from Google Sheets`
   - Click **"Create and Continue"**

4. **Grant Permissions (Optional)**
   - **Role:** Leave blank or select "Viewer" (not critical for this use case)
   - Click **"Continue"**

5. **Grant User Access (Optional)**
   - Skip this step
   - Click **"Done"**

---

## Step 4: Generate Credentials JSON

1. **Find Your Service Account**
   - You should see your service account listed
   - Email format: `synops-metrics-service@{project-id}.iam.gserviceaccount.com`

2. **Create Key**
   - Click on the service account email
   - Go to the **"Keys"** tab
   - Click **"Add Key"** → **"Create new key"**

3. **Download JSON Key**
   - Select **"JSON"** format
   - Click **"Create"**
   - A JSON file will download automatically
   - **IMPORTANT:** Keep this file secure! It contains sensitive credentials

4. **Save the JSON File**
   - Rename it to: `google-sheets-credentials.json`
   - Move it to your project:
     ```
     /Users/pranav/MY_PROJECTS/.../0004_Dashboard/credentials/google-sheets-credentials.json
     ```

---

## Step 5: Share Google Sheet with Service Account

1. **Copy Service Account Email**
   - From the JSON file, find the `client_email` field
   - Or from Google Cloud Console: the service account email
   - Example: `synops-metrics-service@company-dashboard-43211234.iam.gserviceaccount.com`

2. **Open Your Google Sheet**
   - Go to your Google Sheet with the dashboard data

3. **Share the Sheet**
   - Click the **"Share"** button (top right)
   - Paste the service account email
   - Set permission to **"Viewer"**
   - **Uncheck** "Notify people" (it's a service account, not a person)
   - Click **"Share"** or **"Send"**

---

## Step 6: Configure Environment Variables

### Option A: Using Credentials File Path (Recommended)

1. **Open your `.env` file**
   ```bash
   /Users/pranav/MY_PROJECTS/.../0004_Dashboard/backend/.env
   ```

2. **Add these variables:**
   ```env
   # Google Sheets Integration
   GOOGLE_SHEETS_ID=your_spreadsheet_id_here
   GOOGLE_SHEETS_CREDENTIALS_PATH=credentials/google-sheets-credentials.json
   ```

3. **Get your Spreadsheet ID:**
   - Open your Google Sheet
   - Look at the URL:
     ```
     https://docs.google.com/spreadsheets/d/13onwh6tmBCZw9T6zVITxVmpbrrsksNiWldvVsHDNIQU/edit
     ```
   - Copy the ID between `/d/` and `/edit`:
     ```
     13onwh6tmBCZw9T6zVITxVmpbrrsksNiWldvVsHDNIQU
     ```

### Option B: Using Individual Credentials (Alternative)

If you prefer to extract credentials directly:

1. **Open the JSON credentials file**

2. **Extract these values:**
   ```json
   {
     "project_id": "company-dashboard-43211234",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "synops-metrics-service@company-dashboard-43211234.iam.gserviceaccount.com"
   }
   ```

3. **Add to `.env`:**
   ```env
   GOOGLE_PROJECT_ID=company-dashboard-43211234
   GOOGLE_SERVICE_ACCOUNT_EMAIL=synops-metrics-service@company-dashboard-43211234.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAI...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEETS_ID=your_spreadsheet_id_here
   ```

   **IMPORTANT:** Keep the quotes around `GOOGLE_PRIVATE_KEY` and preserve `\n` characters!

---

## ✅ Verify Setup

### Test 1: Check Backend Logs

1. **Restart your backend server:**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload
   ```

2. **Look for errors** in the terminal output

### Test 2: Test API Endpoint

1. **Open your browser or use curl:**
   ```bash
   curl http://localhost:8000/api/metrics/mrr
   ```

2. **Expected response:**
   ```json
   {
     "current_value": 16000,
     "previous_value": 15200,
     "change_percentage": 5.26,
     "trend": "up",
     "sparkline": [14000, 14500, 15200, 15800, 16000],
     "last_updated": "2024-11-24T22:05:00Z"
   }
   ```

### Test 3: Check Dashboard UI

1. **Open dashboard:** http://localhost:3000
2. **Login** with your credentials
3. **Verify metrics display** on the dashboard

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `google-sheets-credentials.json` in `credentials/` folder
- Add `credentials/` to `.gitignore`
- Use environment variables for sensitive data
- Limit service account permissions to "Viewer"
- Regularly rotate service account keys (every 90 days)

### ❌ DON'T:
- Commit credentials to Git
- Share credentials publicly
- Use personal Google account for service account
- Give "Editor" permissions unless necessary

---

## 🐛 Troubleshooting

### Error: "Permission denied"
**Solution:** Make sure you shared the Google Sheet with the service account email

### Error: "Invalid credentials"
**Solution:** 
- Check that `GOOGLE_PRIVATE_KEY` has proper `\n` characters
- Verify the private key is wrapped in quotes in `.env`
- Ensure no extra spaces in the key

### Error: "Spreadsheet not found"
**Solution:** 
- Verify `GOOGLE_SHEETS_ID` is correct
- Check that the sheet is shared with the service account

### Error: "API not enabled"
**Solution:** 
- Go back to Step 2 and enable Google Sheets API
- Wait a few minutes for propagation

### Error: "Quota exceeded"
**Solution:** 
- Google Sheets API has rate limits
- The dashboard caches data for 5 minutes
- For high-traffic apps, consider upgrading quota

---

## 📚 Additional Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
- [Google Cloud Console](https://console.cloud.google.com)

---

## 🎉 Next Steps

After completing this setup:

1. ✅ Add sample data to your Google Sheet (see `sheet_setup_guide.md`)
2. ✅ Test all metrics calculations (see `metrics_calculations_guide.md`)
3. ✅ Verify dashboard displays correctly
4. ✅ Set up Monthly_Snapshots for historical tracking

---

## 💡 Pro Tips

1. **Create a test sheet first** to experiment without affecting production data
2. **Use Google Sheets formulas** to auto-calculate some fields
3. **Set up data validation** in Google Sheets to prevent input errors
4. **Create a backup** of your credentials JSON file
5. **Document your Spreadsheet ID** in a secure location
