# Service Account Setup Guide

## 🎯 Overview

This guide walks you through creating a Google Cloud service account for Google Sheets API access.

## 📋 Prerequisites

- Google Account
- Access to Google Cloud Console

## 🚀 Step-by-Step Instructions

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Create New Project

1. Click the project dropdown at the top
2. Click "New Project"
3. Enter project details:
   - **Project name**: `TRART Dashboard Metrics`
   - **Organization**: (leave as default)
   - **Location**: (leave as default)
4. Click "Create"
5. Wait for project creation (takes a few seconds)
6. Select the new project from the dropdown

### Step 3: Enable Google Sheets API

1. In the left sidebar, go to "APIs & Services" → "Library"
2. In the search box, type "Google Sheets API"
3. Click on "Google Sheets API"
4. Click the "Enable" button
5. Wait for API to be enabled

### Step 4: Create Service Account

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" at the top
3. Select "Service Account"
4. Fill in service account details:
   - **Service account name**: `metrics-sync-service`
   - **Service account ID**: `metrics-sync` (auto-filled)
   - **Service account description**: `Service account for syncing business metrics from Google Sheets`
5. Click "Create and Continue"

### Step 5: Grant Permissions

1. In the "Grant this service account access to project" section:
   - **Role**: Select "Editor"
   - Or create a custom role with just Sheets access
2. Click "Continue"
3. Skip the "Grant users access to this service account" section
4. Click "Done"

### Step 6: Create and Download Key

1. In the Credentials page, find your service account in the list
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" → "Create new key"
5. Select "JSON" as the key type
6. Click "Create"
7. The JSON file will automatically download
8. **IMPORTANT**: Save this file securely - you cannot download it again!

### Step 7: Rename and Store Credentials

1. Locate the downloaded JSON file (usually in Downloads folder)
2. Rename it to: `google-sheets-credentials.json`
3. Move it to a secure location in your project:
   ```bash
   mkdir -p backend/credentials
   mv ~/Downloads/google-sheets-credentials.json backend/credentials/
   ```
4. Set proper permissions:
   ```bash
   chmod 600 backend/credentials/google-sheets-credentials.json
   ```

### Step 8: Get Service Account Email

1. Open the JSON file
2. Find the `client_email` field
3. Copy the email address (looks like: `metrics-sync@project-id.iam.gserviceaccount.com`)
4. You'll need this to share your spreadsheet

### Step 9: Update .gitignore

Add to your `.gitignore` file:
```
# Google Sheets credentials
backend/credentials/
*.json
!package.json
!tsconfig.json
```

### Step 10: Configure Environment Variables

Add to your `.env` file:
```env
GOOGLE_SHEETS_CREDENTIALS_PATH=/absolute/path/to/backend/credentials/google-sheets-credentials.json
```

**Example**:
```env
GOOGLE_SHEETS_CREDENTIALS_PATH=/Users/pranav/dashboard/backend/credentials/google-sheets-credentials.json
```

## 🔐 Security Best Practices

### 1. Never Commit Credentials
- ✅ Add credentials to `.gitignore`
- ✅ Use environment variables
- ❌ Never commit JSON file to Git
- ❌ Never share credentials publicly

### 2. Limit Permissions
- ✅ Use least privilege principle
- ✅ Only grant necessary API access
- ❌ Don't use "Owner" role unless necessary

### 3. Rotate Credentials
- ✅ Rotate keys every 90 days
- ✅ Delete old keys after rotation
- ✅ Monitor service account usage

### 4. Monitor Access
- ✅ Enable audit logging
- ✅ Review service account activity
- ✅ Set up alerts for unusual activity

## 🧪 Test the Setup

Create a test script: `test_service_account.py`

```python
import os
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Path to credentials
CREDENTIALS_PATH = os.getenv('GOOGLE_SHEETS_CREDENTIALS_PATH')

# Load credentials
credentials = service_account.Credentials.from_service_account_file(
    CREDENTIALS_PATH,
    scopes=['https://www.googleapis.com/auth/spreadsheets']
)

# Build service
service = build('sheets', 'v4', credentials=credentials)

# Test connection
print("✅ Service account authenticated successfully!")
print(f"Service account email: {credentials.service_account_email}")
```

Run the test:
```bash
python test_service_account.py
```

Expected output:
```
✅ Service account authenticated successfully!
Service account email: metrics-sync@project-id.iam.gserviceaccount.com
```

## 🐛 Troubleshooting

### Error: "File not found"
**Solution**: Check the path in `GOOGLE_SHEETS_CREDENTIALS_PATH` is absolute and correct

### Error: "Permission denied"
**Solution**: 
```bash
chmod 600 backend/credentials/google-sheets-credentials.json
```

### Error: "API not enabled"
**Solution**: Go back to Google Cloud Console and enable Google Sheets API

### Error: "Invalid credentials"
**Solution**: 
- Download a new key from Google Cloud Console
- Ensure JSON file is not corrupted
- Check file is valid JSON

## 📝 Credential File Structure

Your JSON file should look like this:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "metrics-sync@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## ✅ Setup Checklist

- [ ] Created Google Cloud project
- [ ] Enabled Google Sheets API
- [ ] Created service account
- [ ] Downloaded JSON credentials
- [ ] Renamed file to `google-sheets-credentials.json`
- [ ] Moved to `backend/credentials/`
- [ ] Set file permissions (chmod 600)
- [ ] Added to `.gitignore`
- [ ] Updated `.env` file
- [ ] Copied service account email
- [ ] Tested connection

## 🔄 Rotating Credentials

When it's time to rotate (every 90 days):

1. Go to Google Cloud Console → Service Accounts
2. Click on your service account
3. Go to "Keys" tab
4. Click "Add Key" → "Create new key"
5. Download new JSON file
6. Replace old file with new file
7. Delete old key from Google Cloud Console
8. Restart your application

## 📚 Additional Resources

- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)
