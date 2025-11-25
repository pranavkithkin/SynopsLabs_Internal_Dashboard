"""
Google Sheets Service
Handles reading and writing data to Google Sheets for business metrics
"""
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class GoogleSheetsService:
    def __init__(self):
        """Initialize Google Sheets API client"""
        self.spreadsheet_id = os.getenv("GOOGLE_SHEETS_ID")
        self.credentials = None
        self.service = None
        
        # Initialize if credentials are available
        credentials_path = os.getenv("GOOGLE_SHEETS_CREDENTIALS_PATH")
        if credentials_path and os.path.exists(credentials_path):
            self._initialize_service(credentials_path)
    
    def _initialize_service(self, credentials_path: str):
        """Initialize Google Sheets API service"""
        try:
            SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
            self.credentials = service_account.Credentials.from_service_account_file(
                credentials_path, scopes=SCOPES
            )
            self.service = build('sheets', 'v4', credentials=self.credentials)
        except Exception as e:
            print(f"Failed to initialize Google Sheets service: {e}")
            self.service = None
    
    def _read_sheet(self, range_name: str) -> List[List[Any]]:
        """Read data from a specific sheet range"""
        if not self.service or not self.spreadsheet_id:
            raise Exception("Google Sheets service not initialized")
        
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.spreadsheet_id,
                range=range_name
            ).execute()
            return result.get('values', [])
        except HttpError as error:
            print(f"An error occurred reading sheet: {error}")
            return []
    
    def _write_sheet(self, range_name: str, values: List[List[Any]]):
        """Write data to a specific sheet range"""
        if not self.service or not self.spreadsheet_id:
            raise Exception("Google Sheets service not initialized")
        
        try:
            body = {'values': values}
            self.service.spreadsheets().values().append(
                spreadsheetId=self.spreadsheet_id,
                range=range_name,
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()
        except HttpError as error:
            print(f"An error occurred writing to sheet: {error}")
            raise
    
    # ==================== CUSTOMERS SHEET ====================
    
    def sync_customers(self) -> List[Dict[str, Any]]:
        """Read customer data from Sheet 1"""
        data = self._read_sheet('Customers!A2:H')  # Skip header row
        
        customers = []
        for row in data:
            if len(row) < 6:  # Minimum required columns
                continue
            
            try:
                customer = {
                    'customer_name': row[0] if len(row) > 0 else '',
                    'setup_fee': float(row[1]) if len(row) > 1 and row[1] else 0,
                    'mrr': float(row[2]) if len(row) > 2 and row[2] else 0,
                    'start_date': row[3] if len(row) > 3 else '',
                    'industry': row[4] if len(row) > 4 else '',
                    'status': row[5] if len(row) > 5 else 'Active',
                    'plan_duration': int(row[6]) if len(row) > 6 and row[6] else 12,
                    'notes': row[7] if len(row) > 7 else ''
                }
                customers.append(customer)
            except (ValueError, IndexError) as e:
                print(f"Error parsing customer row: {e}")
                continue
        
        return customers
    
    def add_customer(self, customer_data: Dict[str, Any]) -> bool:
        """Add a new customer to the Customers sheet"""
        row = [
            customer_data.get('customer_name', ''),
            customer_data.get('setup_fee', 0),
            customer_data.get('mrr', 0),
            customer_data.get('start_date', datetime.now().strftime('%Y-%m-%d')),
            customer_data.get('industry', ''),
            customer_data.get('status', 'Active'),
            customer_data.get('plan_duration', 12),
            customer_data.get('notes', '')
        ]
        
        try:
            self._write_sheet('Customers!A:H', [row])
            return True
        except Exception as e:
            print(f"Error adding customer: {e}")
            return False
    
    # ==================== EXPENSES SHEET ====================
    
    def sync_expenses(self) -> List[Dict[str, Any]]:
        """Read expense data from Sheet 2"""
        data = self._read_sheet('Expenses!A2:E')  # Skip header row
        
        expenses = []
        for row in data:
            if len(row) < 3:  # Minimum required columns
                continue
            
            try:
                expense = {
                    'date': row[0] if len(row) > 0 else '',
                    'category': row[1] if len(row) > 1 else '',
                    'amount': float(row[2]) if len(row) > 2 and row[2] else 0,
                    'description': row[3] if len(row) > 3 else '',
                    'added_by': row[4] if len(row) > 4 else ''
                }
                expenses.append(expense)
            except (ValueError, IndexError) as e:
                print(f"Error parsing expense row: {e}")
                continue
        
        return expenses
    
    def add_expense(self, expense_data: Dict[str, Any]) -> bool:
        """Add a new expense to the Expenses sheet"""
        row = [
            expense_data.get('date', datetime.now().strftime('%Y-%m-%d')),
            expense_data.get('category', ''),
            expense_data.get('amount', 0),
            expense_data.get('description', ''),
            expense_data.get('added_by', '')
        ]
        
        try:
            self._write_sheet('Expenses!A:E', [row])
            return True
        except Exception as e:
            print(f"Error adding expense: {e}")
            return False
    
    # ==================== PROJECTS SHEET ====================
    
    def sync_projects(self) -> List[Dict[str, Any]]:
        """Read project data from Sheet 3"""
        data = self._read_sheet('Projects!A2:H')  # Skip header row
        
        projects = []
        for row in data:
            if len(row) < 6:  # Minimum required columns
                continue
            
            try:
                project = {
                    'client_name': row[0] if len(row) > 0 else '',
                    'project_name': row[1] if len(row) > 1 else '',
                    'completion_date': row[2] if len(row) > 2 else '',
                    'documentation_link': row[3] if len(row) > 3 else '',
                    'value_type': row[4] if len(row) > 4 else '',
                    'value_amount': float(row[5]) if len(row) > 5 and row[5] else 0,
                    'calculated_by': row[6] if len(row) > 6 else 'Manual',
                    'notes': row[7] if len(row) > 7 else ''
                }
                projects.append(project)
            except (ValueError, IndexError) as e:
                print(f"Error parsing project row: {e}")
                continue
        
        return projects
    
    def add_project(self, project_data: Dict[str, Any]) -> bool:
        """Add a new project to the Projects sheet"""
        row = [
            project_data.get('client_name', ''),
            project_data.get('project_name', ''),
            project_data.get('completion_date', datetime.now().strftime('%Y-%m-%d')),
            project_data.get('documentation_link', ''),
            project_data.get('value_type', ''),
            project_data.get('value_amount', 0),
            project_data.get('calculated_by', 'Manual'),
            project_data.get('notes', '')
        ]
        
        try:
            self._write_sheet('Projects!A:H', [row])
            return True
        except Exception as e:
            print(f"Error adding project: {e}")
            return False
    
    # ==================== STRATEGIC SHEET ====================
    
    def sync_strategic(self) -> Dict[str, Any]:
        """Read strategic planning data from Sheet 4"""
        data = self._read_sheet('Strategic!A2:D')  # Skip header row
        
        strategic_data = {}
        for row in data:
            if len(row) < 2:
                continue
            
            metric_name = row[0]
            try:
                # Try to convert to float, otherwise keep as string
                value = float(row[1]) if row[1] else 0
            except (ValueError, TypeError):
                value = row[1]
            
            strategic_data[metric_name] = value
        
        return strategic_data
    
    def update_strategic(self, metric_name: str, value: Any) -> bool:
        """Update a strategic metric value"""
        # This would require finding the row and updating it
        # For now, we'll just read and write the whole sheet
        # TODO: Implement targeted update
        return True


# Singleton instance
sheets_service = GoogleSheetsService()
