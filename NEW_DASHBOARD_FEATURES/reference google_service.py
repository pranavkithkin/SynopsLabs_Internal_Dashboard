"""
Google Workspace integration service
"""
from google.oauth2 import service_account
from googleapiclient.discovery import build
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from config import settings
import json


class GoogleCalendarService:
    """Service for Google Calendar integration"""
    
    def __init__(self):
        # Load service account credentials
        credentials_info = {
            "type": "service_account",
            "project_id": settings.GOOGLE_PROJECT_ID,
            "private_key": settings.GOOGLE_PRIVATE_KEY.replace('\\n', '\n'),
            "client_email": settings.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        
        self.credentials = service_account.Credentials.from_service_account_info(
            credentials_info,
            scopes=['https://www.googleapis.com/auth/calendar']
        )
        
        self.service = build('calendar', 'v3', credentials=self.credentials)
        self.calendar_id = settings.GOOGLE_CALENDAR_ID
    
    async def get_upcoming_events(self, max_results: int = 10) -> List[Dict]:
        """
        Get upcoming calendar events
        """
        try:
            now = datetime.utcnow().isoformat() + 'Z'
            
            events_result = self.service.events().list(
                calendarId=self.calendar_id,
                timeMin=now,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            return [
                {
                    "id": event['id'],
                    "title": event.get('summary', 'No title'),
                    "start": event['start'].get('dateTime', event['start'].get('date')),
                    "end": event['end'].get('dateTime', event['end'].get('date')),
                    "attendees": [a.get('email') for a in event.get('attendees', [])],
                    "location": event.get('location'),
                    "description": event.get('description')
                }
                for event in events
            ]
        except Exception as e:
            print(f"Error fetching calendar events: {e}")
            return []
    
    async def create_event(
        self,
        title: str,
        start_time: datetime,
        end_time: datetime,
        attendees: Optional[List[str]] = None,
        description: Optional[str] = None
    ) -> Optional[str]:
        """
        Create a new calendar event
        """
        try:
            event = {
                'summary': title,
                'description': description or '',
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'UTC',
                },
            }
            
            if attendees:
                event['attendees'] = [{'email': email} for email in attendees]
            
            created_event = self.service.events().insert(
                calendarId=self.calendar_id,
                body=event
            ).execute()
            
            return created_event.get('id')
        except Exception as e:
            print(f"Error creating calendar event: {e}")
            return None
    
    async def sync_events(self, payload: Dict):
        """Sync events from n8n workflow"""
        # Process calendar sync payload
        pass


class GoogleSheetsService:
    """Service for Google Sheets integration"""
    
    def __init__(self):
        credentials_info = {
            "type": "service_account",
            "project_id": settings.GOOGLE_PROJECT_ID,
            "private_key": settings.GOOGLE_PRIVATE_KEY.replace('\\n', '\n'),
            "client_email": settings.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            "token_uri": "https://oauth2.googleapis.com/token",
        }
        
        self.credentials = service_account.Credentials.from_service_account_info(
            credentials_info,
            scopes=['https://www.googleapis.com/auth/spreadsheets']
        )
        
        self.service = build('sheets', 'v4', credentials=self.credentials)
    
    async def read_range(self, spreadsheet_id: str, range_name: str) -> List[List]:
        """
        Read data from a Google Sheet range
        """
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            return result.get('values', [])
        except Exception as e:
            print(f"Error reading from Google Sheets: {e}")
            return []
    
    async def write_range(
        self,
        spreadsheet_id: str,
        range_name: str,
        values: List[List]
    ) -> bool:
        """
        Write data to a Google Sheet range
        """
        try:
            body = {'values': values}
            
            self.service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                body=body
            ).execute()
            
            return True
        except Exception as e:
            print(f"Error writing to Google Sheets: {e}")
            return False
    
    async def append_row(
        self,
        spreadsheet_id: str,
        range_name: str,
        values: List
    ) -> bool:
        """
        Append a row to a Google Sheet
        """
        try:
            body = {'values': [values]}
            
            self.service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='RAW',
                body=body
            ).execute()
            
            return True
        except Exception as e:
            print(f"Error appending to Google Sheets: {e}")
            return False
