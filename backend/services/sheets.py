"""
Google Sheets Service for Dashboard Metrics
Follows the reference pattern from google_service.py
"""
from google.oauth2 import service_account
from googleapiclient.discovery import build
from typing import List, Dict, Optional
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()


class GoogleSheetsService:
    """Service for Google Sheets integration"""
    
    def __init__(self):
        # Load credentials from environment
        credentials_info = {
            "type": "service_account",
            "project_id": os.getenv('GOOGLE_PROJECT_ID'),
            "private_key": os.getenv('GOOGLE_PRIVATE_KEY', '').replace('\\n', '\n'),
            "client_email": os.getenv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        
        self.credentials = service_account.Credentials.from_service_account_info(
            credentials_info,
            scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
        )
        
        self.service = build('sheets', 'v4', credentials=self.credentials)
        self.spreadsheet_id = os.getenv('GOOGLE_SHEETS_ID')
        
        # Cache
        self._cache = {}
        self._cache_time = {}
        self._cache_duration = 300  # 5 minutes in seconds
    
    async def read_range(self, range_name: str) -> List[List]:
        """
        Read data from a Google Sheet range
        """
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=range_name
            ).execute()
            
            return result.get('values', [])
        except Exception as e:
            print(f"Error reading from Google Sheets: {e}")
            return []
    
    def _is_cache_valid(self, key: str) -> bool:
        """Check if cached data is still valid"""
        if key not in self._cache or key not in self._cache_time:
            return False
        
        elapsed = (datetime.now() - self._cache_time[key]).total_seconds()
        return elapsed < self._cache_duration
    
    async def get_customers(self) -> List[Dict]:
        """Get all customers data"""
        cache_key = 'customers'
        
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        values = await self.read_range('Customers!A:I')  # A to I covers all columns
        if not values:
            return []
        
        headers = values[0]
        customers = []
        
        for row in values[1:]:
            if len(row) < len(headers):
                row += [None] * (len(headers) - len(row))
            
            customer = dict(zip(headers, row))
            
            # Convert MRR to float
            if customer.get('MRR'):
                try:
                    mrr_val = str(customer['MRR']).strip().replace(',', '')
                    customer['MRR'] = float(mrr_val) if mrr_val else 0
                except:
                    customer['MRR'] = 0
            else:
                customer['MRR'] = 0
            
            # Convert Previous_Month_Revenue to float
            if customer.get('Previous_Month_Revenue'):
                try:
                    prev_val = str(customer['Previous_Month_Revenue']).strip().replace(',', '')
                    customer['Previous_Month_Revenue'] = float(prev_val) if prev_val else 0
                except:
                    customer['Previous_Month_Revenue'] = 0
            else:
                customer['Previous_Month_Revenue'] = 0
                    
            # Convert Plan_Duration to int (months)
            if customer.get('Plan_Duration'):
                try:
                    duration_val = str(customer['Plan_Duration']).strip()
                    customer['Plan_Duration'] = int(float(duration_val)) if duration_val else 12
                except:
                    customer['Plan_Duration'] = 12
            else:
                customer['Plan_Duration'] = 12
                    
            # Convert Setup_Fee to float
            if customer.get('Setup_Fee'):
                try:
                    fee_val = str(customer['Setup_Fee']).strip().replace(',', '')
                    customer['Setup_Fee'] = float(fee_val) if fee_val else 0
                except:
                    customer['Setup_Fee'] = 0
            else:
                customer['Setup_Fee'] = 0
            
            customers.append(customer)
        
        self._cache[cache_key] = customers
        self._cache_time[cache_key] = datetime.now()
        
        return customers
    
    async def get_expenses(self) -> List[Dict]:
        """Get all expenses data"""
        cache_key = 'expenses'
        
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        values = await self.read_range('Expenses!A:E')
        if not values:
            return []
        
        headers = values[0]
        expenses = []
        
        for row in values[1:]:
            if len(row) < len(headers):
                row += [None] * (len(headers) - len(row))
            
            expense = dict(zip(headers, row))
            
            # Convert Amount to float
            if expense.get('Amount'):
                try:
                    expense['Amount'] = float(str(expense['Amount']).replace(',', ''))
                except:
                    expense['Amount'] = 0
            
            expenses.append(expense)
        
        self._cache[cache_key] = expenses
        self._cache_time[cache_key] = datetime.now()
        
        return expenses
    
    async def get_projects(self) -> List[Dict]:
        """Get all projects data"""
        cache_key = 'projects'
        
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        values = await self.read_range('Projects!A:I')  # A to I covers all columns
        if not values:
            return []
        
        headers = values[0]
        projects = []
        
        for row in values[1:]:
            if len(row) < len(headers):
                row += [None] * (len(headers) - len(row))
            
            project = dict(zip(headers, row))
            
            # Convert Value_Amount to float
            if project.get('Value_Amount'):
                try:
                    project['Value_Amount'] = float(str(project['Value_Amount']).replace(',', ''))
                except:
                    project['Value_Amount'] = 0
            
            projects.append(project)
        
        self._cache[cache_key] = projects
        self._cache_time[cache_key] = datetime.now()
        
        return projects
    
    async def get_monthly_snapshots(self) -> List[Dict]:
        """Get monthly snapshots for historical tracking"""
        cache_key = 'snapshots'
        
        if self._is_cache_valid(cache_key):
            return self._cache[cache_key]
        
        values = await self.read_range('Monthly_Snapshots!A:H')
        if not values:
            return []
        
        headers = values[0]
        snapshots = []
        
        for row in values[1:]:
            if len(row) < len(headers):
                row += [None] * (len(headers) - len(row))
            
            snapshot = dict(zip(headers, row))
            
            # Convert numeric fields
            for field in ['MRR', 'Active_Customers', 'New_Customers', 'Churned_Customers', 
                         'Total_Expenses', 'Marketing_Spend', 'Net_New_ARR']:
                if snapshot.get(field):
                    try:
                        snapshot[field] = float(str(snapshot[field]).replace(',', ''))
                    except:
                        snapshot[field] = 0
            
            snapshots.append(snapshot)
        
        self._cache[cache_key] = snapshots
        self._cache_time[cache_key] = datetime.now()
        
        return snapshots
    
    def clear_cache(self):
        """Clear all cached data"""
        self._cache = {}
        self._cache_time = {}


# Singleton instance
sheets_service = GoogleSheetsService()
