"""
Synops Labs Dashboard - Main FastAPI Application
Fixed to match frontend expectations exactly
Cache cleared: 2025-11-24 23:02
"""
from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import os
import json
from dotenv import load_dotenv
from services.sheets import sheets_service
from services.calculations import (
    calculate_mrr, calculate_cac, calculate_ltv, calculate_qvc, calculate_ltgp,
    calculate_nrr, calculate_gross_margin, calculate_customer_concentration
)

load_dotenv()

app = FastAPI(
    title="Synops Labs API",
    description="Backend API for Synops Labs Dashboard",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

# ============================================
# MODELS
# ============================================

class LoginRequest(BaseModel):
    email: str
    password: str

class MetricResponse(BaseModel):
    current_value: float
    previous_value: float
    change_percentage: float
    trend: str
    sparkline: List[float]
    last_updated: str

# Chat Models
class ChatMessage(BaseModel):
    conversation_id: str
    content: str
    sender_id: int

class TypingIndicator(BaseModel):
    conversation_id: str
    is_typing: bool

# Admin Models
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    department: str
    hierarchy_level: int
    is_active: bool = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    hierarchy_level: Optional[int] = None
    is_active: Optional[bool] = None
    permissions: Optional[Dict[str, bool]] = None

class PermissionUpdate(BaseModel):
    permissions: Dict[str, bool]

class AuditLogEntry(BaseModel):
    user_id: int
    user_name: str
    action: str
    details: str
    ip_address: str
    timestamp: str

class SystemConfigUpdate(BaseModel):
    company_name: Optional[str] = None
    theme_color: Optional[str] = None
    session_timeout: Optional[int] = None
    password_min_length: Optional[int] = None
    password_require_special: Optional[bool] = None
    password_require_number: Optional[bool] = None

# ============================================
# MOCK DATA
# ============================================

# In-memory storage for users (expanded with hierarchy)
MOCK_USERS = {
    "pranav@synopslabs.com": {
        "id": 1,
        "name": "Pranav",
        "email": "pranav@synopslabs.com",
        "role": "Founder & CEO",
        "department": "Executive",
        "hierarchy_level": 1,
        "is_active": True,
        "last_login": "2025-11-24T12:30:00Z",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-11-24T12:30:00Z",
        "permissions": {
            "metrics.mrr.view": True,
            "metrics.cac.view": True,
            "metrics.ltv.view": True,
            "metrics.qvc.view": True,
            "metrics.ltgp.view": True,
            "kpis.sales.view": True,
            "kpis.marketing.view": True,
            "kpis.operations.view": True,
            "kpis.finance.view": True,
            "alfred.chat": True,
            "admin.settings.access": True,
            "admin.users.view": True,
            "admin.users.create": True,
            "admin.users.edit": True,
            "admin.users.delete": True,
            "admin.permissions.view": True,
            "admin.permissions.edit": True,
            "admin.logs.view": True,
            "admin.logs.export": True,
            "admin.config.view": True,
            "admin.config.edit": True,
        }
    },
    "fazil@synopslabs.com": {
        "id": 2,
        "name": "Fazil",
        "email": "fazil@synopslabs.com",
        "role": "Co-Founder",
        "department": "Executive",
        "hierarchy_level": 2,
        "is_active": True,
        "last_login": "2025-11-24T11:00:00Z",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-11-24T11:00:00Z",
        "permissions": {
            "metrics.mrr.view": True,
            "metrics.cac.view": True,
            "metrics.ltv.view": True,
            "metrics.qvc.view": True,
            "metrics.ltgp.view": True,
            "kpis.sales.view": True,
            "kpis.marketing.view": True,
            "kpis.operations.view": True,
            "kpis.finance.view": True,
            "alfred.chat": True,
        }
    },
    "suhail@synopslabs.com": {
        "id": 3,
        "name": "Suhail",
        "email": "suhail@synopslabs.com",
        "role": "Agent",
        "department": "Sales",
        "hierarchy_level": 5,
        "is_active": True,
        "last_login": "2025-11-24T10:15:00Z",
        "created_at": "2025-02-01T00:00:00Z",
        "updated_at": "2025-11-24T10:15:00Z",
        "permissions": {
            "metrics.mrr.view": True,
            "metrics.cac.view": True,
            "metrics.ltv.view": False,
            "metrics.qvc.view": False,
            "metrics.ltgp.view": False,
            "kpis.sales.view": True,
            "kpis.marketing.view": False,
            "kpis.operations.view": False,
            "kpis.finance.view": False,
            "alfred.chat": True,
        }
    },
    "sarah@synopslabs.com": {
        "id": 4,
        "name": "Sarah Johnson",
        "email": "sarah@synopslabs.com",
        "role": "Director",
        "department": "Finance",
        "hierarchy_level": 3,
        "is_active": True,
        "last_login": "2025-11-23T16:45:00Z",
        "created_at": "2025-01-15T00:00:00Z",
        "updated_at": "2025-11-23T16:45:00Z",
        "permissions": {
            "metrics.mrr.view": True,
            "metrics.cac.view": True,
            "metrics.ltv.view": True,
            "metrics.qvc.view": True,
            "metrics.ltgp.view": True,
            "kpis.finance.view": True,
            "kpis.operations.view": True,
            "alfred.chat": True,
        }
    },
    "mike@synopslabs.com": {
        "id": 5,
        "name": "Mike Chen",
        "email": "mike@synopslabs.com",
        "role": "Project Lead",
        "department": "Technical",
        "hierarchy_level": 4,
        "is_active": True,
        "last_login": "2025-11-24T09:30:00Z",
        "created_at": "2025-02-10T00:00:00Z",
        "updated_at": "2025-11-24T09:30:00Z",
        "permissions": {
            "metrics.mrr.view": True,
            "kpis.operations.view": True,
            "alfred.chat": True,
        }
    },
    "emma@synopslabs.com": {
        "id": 6,
        "name": "Emma Davis",
        "email": "emma@synopslabs.com",
        "role": "Junior",
        "department": "Marketing",
        "hierarchy_level": 6,
        "is_active": True,
        "last_login": "2025-11-24T08:00:00Z",
        "created_at": "2025-03-01T00:00:00Z",
        "updated_at": "2025-11-24T08:00:00Z",
        "permissions": {
            "metrics.mrr.view": True,
            "kpis.marketing.view": True,
            "alfred.chat": True,
        }
    }
}

# Mock Chat Data
MOCK_CONVERSATIONS = [
    {
        "id": "conv-pranav-fazil",
        "type": "dm",
        "participants": [
            {"id": 1, "name": "Pranav", "avatar": "/avatars/pranav.png", "isOnline": True},
            {"id": 2, "name": "Fazil", "avatar": "/avatars/fazil.png", "isOnline": True}
        ],
        "messages": [
            {
                "id": "msg-1",
                "content": "Hey, how's the dashboard coming along?",
                "timestamp": datetime.now().isoformat(),
                "senderId": 2,
                "isFromCurrentUser": False,
                "isRead": True
            }
        ],
        "unreadCount": 0,
        "lastMessage": {
            "id": "msg-1",
            "content": "Hey, how's the dashboard coming along?",
            "timestamp": datetime.now().isoformat(),
            "senderId": 2,
            "isFromCurrentUser": False
        }
    }
]

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}
    
    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_message(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except:
                self.disconnect(user_id)
    
    async def broadcast(self, message: dict, exclude_user: Optional[int] = None):
        for user_id, connection in list(self.active_connections.items()):
            if user_id != exclude_user:
                try:
                    await connection.send_json(message)
                except:
                    self.disconnect(user_id)

manager = ConnectionManager()

# Audit logs storage
AUDIT_LOGS = []

# System configuration
SYSTEM_CONFIG = {
    "company_name": "Synops Labs",
    "theme_color": "#06b6d4",  # cyan-500
    "session_timeout": 60,  # minutes
    "password_min_length": 8,
    "password_require_special": True,
    "password_require_number": True,
}


# ============================================
# AUTH ENDPOINTS
# ============================================

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Login endpoint - accepts any password for demo"""
    user = MOCK_USERS.get(request.email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Return structure that frontend expects: { user, tokens: { accessToken, refreshToken } }
    return {
        "user": user,
        "tokens": {
            "accessToken": "mock_access_token_" + user["email"],
            "refreshToken": "mock_refresh_token_" + user["email"]
        }
    }

@app.post("/api/auth/refresh")
async def refresh_token(request: dict):
    """Refresh access token"""
    refresh_token = request.get("refreshToken")
    
    if not refresh_token or not refresh_token.startswith("mock_refresh_token_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Extract email from refresh token
    email = refresh_token.replace("mock_refresh_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Return new tokens
    return {
        "tokens": {
            "accessToken": "mock_access_token_" + user["email"],
            "refreshToken": "mock_refresh_token_" + user["email"]
        }
    }

@app.get("/api/auth/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    email = credentials.credentials.replace("mock_access_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return user

@app.get("/api/permissions/me")
async def get_my_permissions(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user's permissions"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    email = credentials.credentials.replace("mock_access_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return {"permissions": user["permissions"]}

# ============================================
# METRICS ENDPOINTS
# ============================================

@app.get("/api/metrics/mrr", response_model=MetricResponse)
async def get_mrr(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get MRR metric from Google Sheets"""
    try:
        customers = await sheets_service.get_customers()
        result = await calculate_mrr(customers)
        
        # Generate sparkline from snapshots if available
        snapshots = await sheets_service.get_monthly_snapshots()
        sparkline = [s.get('MRR', 0) for s in snapshots[-7:]] if snapshots else [result['current_value']]
        
        return MetricResponse(
            current_value=result['current_value'],
            previous_value=result['previous_value'],
            change_percentage=result['change_percentage'],
            trend=result['trend'],
            sparkline=sparkline,
            last_updated=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"Error calculating MRR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching MRR: {str(e)}")

@app.get("/api/metrics/cac", response_model=MetricResponse)
async def get_cac(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get CAC metric from Google Sheets"""
    try:
        customers = await sheets_service.get_customers()
        expenses = await sheets_service.get_expenses()
        result = await calculate_cac(customers, expenses)
        
        # Sparkline placeholder
        sparkline = [result['current_value']] * 7
        
        return MetricResponse(
            current_value=result['current_value'],
            previous_value=result['previous_value'],
            change_percentage=result['change_percentage'],
            trend=result['trend'],
            sparkline=sparkline,
            last_updated=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"Error calculating CAC: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching CAC: {str(e)}")

@app.get("/api/metrics/ltv", response_model=MetricResponse)
async def get_ltv(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get LTV metric from Google Sheets"""
    try:
        customers = await sheets_service.get_customers()
        result = await calculate_ltv(customers)
        
        sparkline = [result['current_value']] * 7
        
        return MetricResponse(
            current_value=result['current_value'],
            previous_value=result['previous_value'],
            change_percentage=result['change_percentage'],
            trend=result['trend'],
            sparkline=sparkline,
            last_updated=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"Error calculating LTV: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching LTV: {str(e)}")

@app.get("/api/metrics/qvc", response_model=MetricResponse)
async def get_qvc(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get QVC metric from Google Sheets"""
    try:
        projects = await sheets_service.get_projects()
        result = await calculate_qvc(projects)
        
        sparkline = [result['current_value']] * 7
        
        return MetricResponse(
            current_value=result['current_value'],
            previous_value=result['previous_value'],
            change_percentage=result['change_percentage'],
            trend=result['trend'],
            sparkline=sparkline,
            last_updated=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"Error calculating QVC: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching QVC: {str(e)}")

@app.get("/api/metrics/ltgp", response_model=MetricResponse)
async def get_ltgp(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get LTGP metric from Google Sheets"""
    try:
        customers = await sheets_service.get_customers()
        result = await calculate_ltgp(customers)
        
        sparkline = [result['current_value']] * 7
        
        return MetricResponse(
            current_value=result['current_value'],
            previous_value=result['previous_value'],
            change_percentage=result['change_percentage'],
            trend=result['trend'],
            sparkline=sparkline,
            last_updated=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"Error calculating LTGP: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching LTGP: {str(e)}")

# ============================================
# ADVANCED METRICS ENDPOINTS
# ============================================

@app.get("/api/metrics/ratios")
async def get_metric_ratios(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get calculated business ratios with health indicators from Google Sheets"""
    try:
        customers = await sheets_service.get_customers()
        
        # Calculate current metrics
        mrr_data = await calculate_mrr(customers)
        cac_data = await calculate_cac(customers, await sheets_service.get_expenses())
        ltv_data = await calculate_ltv(customers)
        
        mrr = mrr_data['current_value']
        cac = cac_data['current_value']
        ltv = ltv_data['current_value']
        previous_mrr = mrr_data['previous_value']
        
        # Calculate CAC:LTV Ratio
        cac_ltv_ratio = ltv / cac if cac > 0 else 0
        
        # Calculate MRR Growth Rate
        mrr_growth_rate = ((mrr - previous_mrr) / previous_mrr * 100) if previous_mrr > 0 else 0
        
        # Calculate Acquisition Efficiency
        acquisition_efficiency = mrr / cac if cac > 0 else 0
        
        # Calculate Burn Multiple (simplified)
        net_burn = mrr * 0.2  # Simplified assumption
        net_new_arr = (mrr - previous_mrr) * 12
        burn_multiple = net_burn / net_new_arr if net_new_arr > 0 else 0
        
        return {
            "cac_ltv_ratio": round(cac_ltv_ratio, 2),
            "cac_ltv_status": "healthy" if cac_ltv_ratio > 3 else "warning" if cac_ltv_ratio >= 2 else "critical",
            "mrr_growth_rate": round(mrr_growth_rate, 2),
            "acquisition_efficiency": round(acquisition_efficiency, 2),
            "burn_multiple": round(burn_multiple, 2),
            "calculated_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error calculating ratios: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calculating ratios: {str(e)}")

@app.get("/api/metrics/{metric_name}/history")
async def get_metric_history(
    metric_name: str,
    days: int = 30,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get time-series history for a metric from Google Sheets"""
    # Validate metric name
    valid_metrics = ['mrr', 'cac', 'ltv', 'qvc', 'ltgp', 'nrr', 'magic_number', 'rule_of_40', 'gross_margin', 'customer_concentration']
    if metric_name not in valid_metrics:
        raise HTTPException(status_code=400, detail=f"Invalid metric name. Must be one of: {', '.join(valid_metrics)}")
    
    try:
        # Get monthly snapshots for historical data
        snapshots = await sheets_service.get_monthly_snapshots()
        
        # If no snapshots yet, return empty history
        if not snapshots:
            return {"history": []}
        
        # Map metric names to snapshot columns
        metric_column_map = {
            'mrr': 'MRR',
            'cac': 'Marketing_Spend',  # Approximate with marketing spend
            'ltv': 'MRR',  # Can calculate from MRR
            'qvc': 'Net_New_ARR',  # Approximate
            'ltgp': 'MRR',  # Can calculate from MRR
            'nrr': 'MRR',  # Can calculate from MRR changes
            'gross_margin': 'MRR',  # Can calculate
            'customer_concentration': 'Active_Customers'  # Approximate
        }
        
        column = metric_column_map.get(metric_name, 'MRR')
        
        # Build history from snapshots
        history = []
        for snapshot in snapshots[-days:]:  # Last N days/months
            if snapshot.get('Date') and snapshot.get(column) is not None:
                history.append({
                    "date": snapshot['Date'],
                    "value": snapshot[column]
                })
        
        return {"history": history}
    except Exception as e:
        print(f"Error fetching history for {metric_name}: {str(e)}")
        # Return empty history instead of error to prevent UI breaking
        return {"history": []}


@app.get("/api/metrics/additional")
async def get_additional_metrics(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get additional AI consultancy metrics from Google Sheets"""
    try:
        customers = await sheets_service.get_customers()
        expenses = await sheets_service.get_expenses()
        
        # Calculate real metrics
        nrr = await calculate_nrr(customers)
        gross_margin = await calculate_gross_margin(customers, expenses)
        customer_concentration = await calculate_customer_concentration(customers)
        
        # Helper functions
        def get_status(current, target):
            if target and current:
                ratio = current / target
                if ratio >= 1.0:
                    return "healthy"
                elif ratio >= 0.9:
                    return "warning"
                else:
                    return "critical"
            return "healthy"
        
        metrics_data = [
            {
                "name": "Net Revenue Retention",
                "key": "nrr",
                "value": nrr,
                "target": 100.0,
                "unit": "%",
                "description": "Revenue retention from existing customers",
                "trend": "up" if nrr > 100 else "down" if nrr < 100 else "neutral",
                "status": get_status(nrr, 100.0)
            },
            {
                "name": "Magic Number",
                "key": "magic_number",
                "value": 0.75,  # Placeholder - needs quarterly data
                "target": 0.75,
                "unit": "ratio",
                "description": "Sales efficiency (New ARR / Sales & Marketing Spend)",
                "trend": "neutral",
                "status": "healthy"
            },
            {
                "name": "Rule of 40",
                "key": "rule_of_40",
                "value": 40.0,  # Placeholder - needs historical data
                "target": 40.0,
                "unit": "%",
                "description": "Growth Rate + Profit Margin",
                "trend": "neutral",
                "status": "healthy"
            },
            {
                "name": "Gross Margin",
                "key": "gross_margin",
                "value": gross_margin,
                "target": 70.0,
                "unit": "%",
                "description": "(Revenue - AI/API Costs) / Revenue",
                "trend": "up" if gross_margin > 70 else "down" if gross_margin < 70 else "neutral",
                "status": get_status(gross_margin, 70.0)
            },
            {
                "name": "Customer Concentration",
                "key": "customer_concentration",
                "value": customer_concentration,
                "target": 30.0,
                "unit": "%",
                "description": "Revenue from top 3 customers",
                "trend": "down" if customer_concentration < 30 else "up",  # Lower is better
                "status": "healthy" if customer_concentration < 30 else "warning" if customer_concentration < 40 else "critical"
            }
        ]
        
        return {"metrics": metrics_data}
    except Exception as e:
        print(f"Error fetching additional metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching additional metrics: {str(e)}")

# ============================================
# ALFRED AI ENDPOINTS
# ============================================

class AlfredMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    dashboard_context: Optional[Dict[str, Any]] = None

class AlfredResponse(BaseModel):
    message: str
    conversation_id: str
    actions_performed: List[str] = []
    function_calls: Optional[List[Dict[str, Any]]] = None

@app.get("/api/alfred/test")
async def test_alfred_openai():
    """Test OpenAI connection directly"""
    import os
    from pathlib import Path
    from dotenv import load_dotenv
    from openai import OpenAI
    
    # Reload env
    env_file = Path(__file__).parent / '.env'
    load_dotenv(env_file, override=True)
    
    api_key = os.getenv("OPENAI_API_KEY")
    
    result = {
        "env_file_exists": env_file.exists(),
        "env_file_path": str(env_file),
        "api_key_loaded": api_key is not None,
        "api_key_length": len(api_key) if api_key else 0,
        "api_key_prefix": api_key[:20] if api_key else "NONE",
    }
    
    if not api_key:
        result["error"] = "No API key found"
        return result
    
    try:
        client = OpenAI(api_key=api_key)
        result["client_created"] = True
        
        # Test with gpt-3.5-turbo
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "say hi"}],
            max_tokens=10
        )
        result["gpt35_success"] = True
        result["gpt35_response"] = response.choices[0].message.content
        
        # Test with gpt-4o
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": "say hi"}],
            max_tokens=10
        )
        result["gpt4o_success"] = True
        result["gpt4o_response"] = response.choices[0].message.content
        
    except Exception as e:
        result["error"] = str(e)
        result["error_type"] = type(e).__name__
        import traceback
        result["traceback"] = traceback.format_exc()
    
    return result

@app.post("/api/alfred/chat", response_model=AlfredResponse)
async def alfred_chat(
    message: AlfredMessage,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Chat with Alfred AI - Real OpenAI Integration"""
    try:
        # Lazy import to avoid startup crashes
        from services.alfred_service import get_alfred_service
        from database.connection import engine, Base, get_db
        from utils.sync_db import sync_user_to_db
        from sqlalchemy.orm import Session
        
        print("✅ Imports successful, creating DB tables...")
        
        # Initialize DB tables if needed (safe - only creates if not exists)
        Base.metadata.create_all(bind=engine)
        
        # Get DB session
        db = next(get_db())
        
        # Get current user
        print(f"🔑 Credentials object: {credentials}")
        print(f"🔑 Credentials type: {type(credentials)}")
        if credentials:
            print(f"🔑 Credentials.credentials: {credentials.credentials[:20] if credentials.credentials else 'NONE'}...")
        
        if not credentials:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        email = credentials.credentials.replace("mock_access_token_", "")
        user = MOCK_USERS.get(email)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Sync user to DB
        db_user = sync_user_to_db(user, db)
        
        # Get Alfred service instance (lazy loaded)
        alfred_service = get_alfred_service()
        print(f"✅ Alfred service ready, calling chat with: '{message.message}'")
        
        # Call real Alfred service
        response_text, conversation_id, function_calls = await alfred_service.chat(
            message=message.message,
            user_id=db_user.id,
            user_name=db_user.name,  # User model uses 'name' not 'full_name'
            user_role=db_user.role,
            conversation_id=message.conversation_id,
            db=db,
            dashboard_context=message.dashboard_context
        )
        
        db.close()
        
        return AlfredResponse(
            message=response_text,
            conversation_id=conversation_id,
            actions_performed=[],
            function_calls=function_calls
        )
        
    except Exception as e:
        # If anything fails, return helpful error message
        error_msg = str(e)
        import traceback
        print(f"❌ Alfred error: {error_msg}")
        print(f"❌ Full traceback:\n{traceback.format_exc()}")
        
        return AlfredResponse(
            message=f"I apologize, but I encountered an issue: {error_msg[:200]}. Please check that the OpenAI API key is configured in the .env file.",
            conversation_id="error-session",
            actions_performed=[],
            function_calls=None
        )

# ============================================
# KPI ENDPOINTS
# ============================================

@app.get("/api/kpis/daily")
async def get_daily_kpis(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get daily KPIs"""
    return {
        "sales": [
            {"name": "Leads Generated", "value": 12, "target": 15, "unit": "leads"},
            {"name": "Deals Closed", "value": 3, "target": 5, "unit": "deals"},
        ],
        "marketing": [
            {"name": "Website Visitors", "value": 450, "target": 500, "unit": "visitors"},
        ]
    }

@app.get("/api/kpis/weekly")
async def get_weekly_kpis(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get weekly KPIs"""
    return {
        "sales": [
            {"name": "Weekly Revenue", "value": 25000, "target": 30000, "unit": "USD"},
        ]
    }

@app.get("/api/kpis/monthly")
async def get_monthly_kpis(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get monthly KPIs"""
    return {
        "sales": [
            {"name": "Monthly Revenue", "value": 95000, "target": 100000, "unit": "USD"},
        ]
    }

# ============================================
# CHAT ENDPOINTS
# ============================================

@app.websocket("/ws/chat/{user_id}")
async def chat_websocket(websocket: WebSocket, user_id: int):
    """WebSocket endpoint for real-time chat"""
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Broadcast message to other users
            await manager.broadcast({
                "type": message_data.get("type", "message"),
                "payload": message_data.get("payload")
            }, exclude_user=user_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id)

@app.get("/api/chat/conversations")
async def get_conversations(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get user's conversations"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # In a real app, filter by current user
    return {"conversations": MOCK_CONVERSATIONS}

@app.get("/api/chat/messages/{conversation_id}")
async def get_messages(
    conversation_id: str,
    limit: int = 50,
    offset: int = 0,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get messages for a conversation"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find conversation
    conversation = next((c for c in MOCK_CONVERSATIONS if c["id"] == conversation_id), None)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    messages = conversation["messages"][offset:offset + limit]
    return {"messages": messages, "total": len(conversation["messages"])}

@app.post("/api/chat/send")
async def send_message(
    message: ChatMessage,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Send a message"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Create new message
    new_message = {
        "id": f"msg-{datetime.now().timestamp()}",
        "content": message.content,
        "timestamp": datetime.now().isoformat(),
        "senderId": message.sender_id,
        "isFromCurrentUser": True,
        "isRead": False
    }
    
    # Find conversation and add message
    for conv in MOCK_CONVERSATIONS:
        if conv["id"] == message.conversation_id:
            conv["messages"].append(new_message)
            conv["lastMessage"] = new_message
            break
    
    # Broadcast via WebSocket
    await manager.broadcast({
        "type": "message",
        "payload": {
            "conversationId": message.conversation_id,
            "message": new_message
        }
    }, exclude_user=message.sender_id)
    
    return {"message": new_message}

@app.post("/api/chat/typing")
async def send_typing_indicator(
    indicator: TypingIndicator,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Send typing indicator"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract user from token
    email = credentials.credentials.replace("mock_access_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Broadcast typing indicator
    await manager.broadcast({
        "type": "typing",
        "payload": {
            "conversationId": indicator.conversation_id,
            "userId": user["id"],
            "userName": user["name"],
            "isTyping": indicator.is_typing
        }
    }, exclude_user=user["id"])
    
    return {"status": "ok"}

# ============================================
# ADMIN PERMISSIONS ENDPOINTS
# ============================================

class PermissionTemplateUpdate(BaseModel):
    permissions: Dict[str, bool]

@app.get("/api/admin/permissions/features")
async def get_all_features(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all available system features"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if user is CEO or admin
    email = credentials.credentials.replace("mock_access_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user or user["role"] not in ["Founder & CEO", "Co-Founder"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Features organized by category
    features = [
        {"key": "metrics.mrr.view", "name": "MRR", "category": "financial", "description": "View Monthly Recurring Revenue"},
        {"key": "metrics.revenue.view", "name": "Revenue", "category": "financial", "description": "View Total Revenue"},
        {"key": "metrics.profit.view", "name": "Profit", "category": "financial", "description": "View Profit Metrics"},
        {"key": "metrics.ltgp.view", "name": "LTGP", "category": "financial", "description": "View Life Time Gross Profit"},
        {"key": "metrics.gross_margin.view", "name": "Gross Margin", "category": "financial", "description": "View Gross Margin"},
        {"key": "metrics.cac.view", "name": "CAC", "category": "sales", "description": "View Customer Acquisition Cost"},
        {"key": "metrics.conversion_rate.view", "name": "Conversion Rate", "category": "sales", "description": "View Conversion Rate"},
        {"key": "metrics.lead_count.view", "name": "Lead Count", "category": "sales", "description": "View Lead Count"},
        {"key": "metrics.customer_count.view", "name": "Customer Count", "category": "sales", "description": "View Customer Count"},
        {"key": "metrics.ltv.view", "name": "LTV", "category": "customer", "description": "View Customer Lifetime Value"},
        {"key": "metrics.qvc.view", "name": "QVC", "category": "customer", "description": "View Quarterly Value Created"},
        {"key": "metrics.retention.view", "name": "Retention", "category": "customer", "description": "View Customer Retention Rate"},
        {"key": "metrics.churn.view", "name": "Churn", "category": "customer", "description": "View Customer Churn Rate"},
        {"key": "metrics.project_count.view", "name": "Project Count", "category": "technical", "description": "View Project Count"},
        {"key": "metrics.task_completion.view", "name": "Task Completion", "category": "technical", "description": "View Task Completion Rate"},
        {"key": "metrics.performance.view", "name": "Performance", "category": "technical", "description": "View Performance Metrics"},
        {"key": "alfred.chat", "name": "Alfred Chat", "category": "admin", "description": "Chat with Alfred AI Assistant"},
        {"key": "admin.users.view", "name": "View Users", "category": "admin", "description": "View Users"},
        {"key": "admin.users.create", "name": "Create Users", "category": "admin", "description": "Create New Users"},
        {"key": "admin.users.edit", "name": "Edit Users", "category": "admin", "description": "Edit User Details"},
        {"key": "admin.users.delete", "name": "Delete Users", "category": "admin", "description": "Delete Users"},
        {"key": "admin.permissions.view", "name": "View Permissions", "category": "admin", "description": "View Permissions"},
        {"key": "admin.permissions.edit", "name": "Edit Permissions", "category": "admin", "description": "Edit Permissions"},
        {"key": "admin.logs.view", "name": "View Logs", "category": "admin", "description": "View System Logs"},
        {"key": "admin.config.view", "name": "View Config", "category": "admin", "description": "View System Configuration"},
        {"key": "admin.config.edit", "name": "Edit Config", "category": "admin", "description": "Edit System Configuration"},
    ]
    
    return {"features": features}

@app.get("/api/admin/permissions/templates")
async def get_all_templates(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all role-department permission templates"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if user is CEO or admin
    email = credentials.credentials.replace("mock_access_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user or user["role"] not in ["Founder & CEO", "Co-Founder"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Default templates for different role-department combinations
    templates = [
        {
            "role": "Co-Founder",
            "department": "Executive",
            "permissions": {k: True for k in [
                "metrics.mrr.view", "metrics.revenue.view", "metrics.profit.view", "metrics.ltgp.view",
                "metrics.cac.view", "metrics.ltv.view", "metrics.qvc.view", "alfred.chat",
                "admin.users.view", "admin.permissions.view"
            ]}
        },
        {
            "role": "Director",
            "department": "Sales",
            "permissions": {
                **{k: True for k in ["metrics.mrr.view", "metrics.revenue.view", "metrics.profit.view", "metrics.cac.view", "metrics.ltv.view", "metrics.qvc.view", "alfred.chat"]},
                **{k: False for k in ["admin.users.view", "admin.permissions.view"]}
            }
        },
        {
            "role": "Director",
            "department": "Technical",
            "permissions": {
                **{k: True for k in ["metrics.ltv.view", "metrics.qvc.view", "metrics.project_count.view", "metrics.task_completion.view", "alfred.chat"]},
                **{k: False for k in ["metrics.profit.view", "metrics.revenue.view", "admin.users.view"]}
            }
        },
        {
            "role": "Agent",
            "department": "Sales",
            "permissions": {
                **{k: True for k in ["metrics.ltv.view", "metrics.qvc.view", "alfred.chat"]},
                **{k: False for k in ["metrics.mrr.view", "metrics.revenue.view", "metrics.profit.view", "metrics.cac.view"]}
            }
        }
    ]
    
    return {"templates": templates}

@app.get("/api/admin/permissions/templates/{role}/{department}")
async def get_template(
    role: str,
    department: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get specific role-department permission template"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if user is CEO or admin
    email = credentials.credentials.replace("mock_access_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user or user["role"] not in ["Founder & CEO", "Co-Founder"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Default permissions structure - all false initially
    default_permissions = {
        "metrics.mrr.view": False,
        "metrics.revenue.view": False,
        "metrics.profit.view": False,
        "metrics.ltgp.view": False,
        "metrics.gross_margin.view": False,
        "metrics.cac.view": False,
        "metrics.ltv.view": False,
        "metrics.qvc.view": False,
        "metrics.project_count.view": False,
        "metrics.task_completion.view": False,
        "metrics.performance.view": False,
        "alfred.chat": True,  # Everyone gets Alfred
        "admin.users.view": False,
        "admin.permissions.view": False,
    }
    
    # Apply role-department specific defaults (case-insensitive comparison)
    role_lower = role.lower().replace(" ", "_")
    dept_lower = department.lower()
    
    if role_lower == "co_founder" or (role_lower == "co-founder"):
        default_permissions = {k: True for k in default_permissions.keys()}
    elif role_lower == "director":
        if dept_lower == "sales":
            for key in ["metrics.mrr.view", "metrics.revenue.view", "metrics.profit.view", "metrics.cac.view", "metrics.ltv.view", "metrics.qvc.view"]:
                default_permissions[key] = True
        elif dept_lower == "technical":
            for key in ["metrics.ltv.view", "metrics.qvc.view", "metrics.project_count.view", "metrics.task_completion.view", "metrics.performance.view"]:
                default_permissions[key] = True
        elif dept_lower == "finance":
            for key in ["metrics.mrr.view", "metrics.revenue.view", "metrics.profit.view", "metrics.ltgp.view", "metrics.gross_margin.view", "metrics.cac.view", "metrics.ltv.view", "metrics.qvc.view"]:
                default_permissions[key] = True
    elif role_lower == "project_lead":
        if dept_lower == "technical":
            for key in ["metrics.ltv.view", "metrics.qvc.view", "metrics.project_count.view", "metrics.task_completion.view", "metrics.performance.view"]:
                default_permissions[key] = True
        elif dept_lower == "sales":
            for key in ["metrics.ltv.view", "metrics.qvc.view", "metrics.customer_count.view"]:
                default_permissions[key] = True
    elif role_lower == "agent":
        if dept_lower == "sales":
            for key in ["metrics.ltv.view", "metrics.qvc.view"]:
                default_permissions[key] = True
        elif dept_lower == "technical":
            for key in ["metrics.project_count.view", "metrics.task_completion.view"]:
                default_permissions[key] = True
    
    return {"role": role, "department": department, "permissions": default_permissions}

@app.put("/api/admin/permissions/templates/{role}/{department}")
async def update_template(
    role: str,
    department: str,
    update: PermissionTemplateUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update role-department permission template"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if user is CEO or admin  
    email = credentials.credentials.replace("mock_access_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user or user["role"] not in ["Founder & CEO", "Co-Founder"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # In a real app, this would save to database
    # For now, just return success
    return {
        "success": True,
        "message": f"Updated permissions for {role} in {department}",
        "role": role,
        "department": department,
        "permissions": update.permissions
    }

@app.post("/api/admin/permissions/reset-defaults")
async def reset_to_defaults(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Reset all permissions to system defaults"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if user is CEO or admin
    email = credentials.credentials.replace("mock_access_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user or user["role"] not in ["Founder & CEO", "Co-Founder"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # In a real app, this would reset database to defaults
    return {
        "success": True,
        "message": "All permissions reset to system defaults"
    }


# ============================================
# HEALTH CHECK
# ============================================

@app.get("/")
def read_root():
    return {"message": "Synops Labs API is running", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
# ============================================
# HELPER FUNCTIONS
# ============================================

def get_user_from_token(credentials: HTTPAuthorizationCredentials) -> Dict:
    """Extract user from token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    email = credentials.credentials.replace("mock_access_token_", "")
    user = MOCK_USERS.get(email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    return user

def check_admin_access(user: Dict) -> None:
    """Verify user has admin access (CEO only)"""
    if user.get("hierarchy_level") != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required (CEO only)"
        )

def log_audit_event(user_id: int, user_name: str, action: str, details: str, ip: str = "127.0.0.1") -> None:
    """Log an audit event"""
    AUDIT_LOGS.append({
        "id": len(AUDIT_LOGS) + 1,
        "user_id": user_id,
        "user_name": user_name,
        "action": action,
        "details": details,
        "ip_address": ip,
        "timestamp": datetime.now().isoformat()
    })

def get_default_permissions(hierarchy_level: int, department: str) -> Dict[str, bool]:
    """Get default permissions based on hierarchy level and department"""
    # Base permissions for all users
    base_permissions = {
        "alfred.chat": True,
    }
    
    # Executive level (1-2: CEO, Co-Founder)
    if hierarchy_level <= 2:
        return {
            **base_permissions,
            "metrics.mrr.view": True,
            "metrics.cac.view": True,
            "metrics.ltv.view": True,
            "metrics.qvc.view": True,
            "metrics.ltgp.view": True,
            "kpis.sales.view": True,
            "kpis.marketing.view": True,
            "kpis.operations.view": True,
            "kpis.finance.view": True,
            "admin.settings.access": hierarchy_level == 1,  # Only CEO
            "admin.users.view": hierarchy_level == 1,
            "admin.users.create": hierarchy_level == 1,
            "admin.users.edit": hierarchy_level == 1,
            "admin.users.delete": hierarchy_level == 1,
            "admin.permissions.view": hierarchy_level == 1,
            "admin.permissions.edit": hierarchy_level == 1,
            "admin.logs.view": hierarchy_level == 1,
            "admin.logs.export": hierarchy_level == 1,
            "admin.config.view": hierarchy_level == 1,
            "admin.config.edit": hierarchy_level == 1,
        }
    
    # Director level (3)
    if hierarchy_level == 3:
        return {
            **base_permissions,
            "metrics.mrr.view": True,
            "metrics.cac.view": True,
            "metrics.ltv.view": True,
            "metrics.qvc.view": department in ["Finance", "Executive"],
            "metrics.ltgp.view": department in ["Finance", "Executive"],
            "kpis.sales.view": department in ["Sales", "Executive"],
            "kpis.marketing.view": department in ["Marketing", "Executive"],
            "kpis.operations.view": department in ["Operations", "Executive"],
            "kpis.finance.view": department in ["Finance", "Executive"],
        }
    
    # Project Lead level (4)
    if hierarchy_level == 4:
        return {
            **base_permissions,
            "metrics.mrr.view": True,
            "kpis.sales.view": department == "Sales",
            "kpis.marketing.view": department == "Marketing",
            "kpis.operations.view": department in ["Operations", "Technical"],
            "kpis.finance.view": department == "Finance",
        }
    
    # Agent/Junior level (5-6)
    return {
        **base_permissions,
        "metrics.mrr.view": True,
        "metrics.cac.view": department == "Sales",
        "kpis.sales.view": department == "Sales",
        "kpis.marketing.view": department == "Marketing",
        "kpis.operations.view": department == "Operations",
    }

# ============================================
# ADMIN API ENDPOINTS
# ============================================

@app.get("/api/admin/users")
async def get_all_users(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    department: Optional[str] = None,
    is_active: Optional[bool] = None
):
    """Get all users with pagination and filters (CEO only)"""
    user = get_user_from_token(credentials)
    check_admin_access(user)
    
    # Get all users
    users = list(MOCK_USERS.values())
    
    # Apply filters
    if search:
        users = [u for u in users if search.lower() in u["name"].lower() or search.lower() in u["email"].lower()]
    if department:
        users = [u for u in users if u["department"] == department]
    if is_active is not None:
        users = [u for u in users if u["is_active"] == is_active]
    
    # Pagination
    total = len(users)
    users = users[skip:skip + limit]
    
    return {
        "data": users,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit
    }

@app.post("/api/admin/users")
async def create_user(
    user_data: UserCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new user (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    # Check if email already exists
    if user_data.email in MOCK_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Create new user
    new_id = max([u["id"] for u in MOCK_USERS.values()]) + 1
    new_user = {
        "id": new_id,
        "name": user_data.name,
        "email": user_data.email,
        "role": user_data.role,
        "department": user_data.department,
        "hierarchy_level": user_data.hierarchy_level,
        "is_active": user_data.is_active,
        "last_login": None,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "permissions": get_default_permissions(user_data.hierarchy_level, user_data.department)
    }
    
    MOCK_USERS[user_data.email] = new_user
    
    # Log audit event
    log_audit_event(
        admin_user["id"],
        admin_user["name"],
        "user_created",
        f"Created user: {user_data.name} ({user_data.email})"
    )
    
    return new_user

@app.get("/api/admin/users/{user_id}")
async def get_user(
    user_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user by ID (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    # Find user by ID
    for user in MOCK_USERS.values():
        if user["id"] == user_id:
            return user
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )

@app.put("/api/admin/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update user (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    # Find user by ID
    target_user = None
    for user in MOCK_USERS.values():
        if user["id"] == user_id:
            target_user = user
            break
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    update_data = user_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "permissions" and value:
            target_user["permissions"].update(value)
        elif value is not None:
            target_user[field] = value
    
    target_user["updated_at"] = datetime.now().isoformat()
    
    # Log audit event
    log_audit_event(
        admin_user["id"],
        admin_user["name"],
        "user_updated",
        f"Updated user: {target_user['name']} ({target_user['email']})"
    )
    
    return target_user

@app.delete("/api/admin/users/{user_id}")
async def delete_user(
    user_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Soft delete user (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    # Find user by ID
    target_user = None
    for user in MOCK_USERS.values():
        if user["id"] == user_id:
            target_user = user
            break
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Soft delete
    target_user["is_active"] = False
    target_user["updated_at"] = datetime.now().isoformat()
    
    # Log audit event
    log_audit_event(
        admin_user["id"],
        admin_user["name"],
        "user_deleted",
        f"Deleted user: {target_user['name']} ({target_user['email']})"
    )
    
    return {"message": "User deleted successfully"}

@app.get("/api/admin/users/{user_id}/permissions")
async def get_user_permissions(
    user_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's permissions (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    # Find user by ID
    for user in MOCK_USERS.values():
        if user["id"] == user_id:
            return {"permissions": user["permissions"]}
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="User not found"
    )

@app.put("/api/admin/users/{user_id}/permissions")
async def update_user_permissions(
    user_id: int,
    permission_data: PermissionUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update user's permissions (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    # Find user by ID
    target_user = None
    for user in MOCK_USERS.values():
        if user["id"] == user_id:
            target_user = user
            break
    
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update permissions
    target_user["permissions"] = permission_data.permissions
    target_user["updated_at"] = datetime.now().isoformat()
    
    # Log audit event
    log_audit_event(
        admin_user["id"],
        admin_user["name"],
        "permission_updated",
        f"Updated permissions for: {target_user['name']} ({target_user['email']})"
    )
    
    return {"permissions": target_user["permissions"]}

@app.post("/api/admin/sync-permissions")
async def sync_all_permissions(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Sync permissions for all users based on their current role (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    updated_count = 0
    for email, user in MOCK_USERS.items():
        # Skip CEO (Pranav)
        if user["hierarchy_level"] == 1:
            continue
            
        # Update permissions based on current role and department
        user["permissions"] = get_default_permissions(
            user["hierarchy_level"],
            user["department"]
        )
        updated_count += 1
    
    log_audit_event(
        admin_user["id"],
        admin_user["name"],
        "permissions_synced",
        f"Synced permissions for {updated_count} users"
    )
    
    return {
        "message": f"Successfully synced permissions for {updated_count} users",
        "updated_count": updated_count
    }


@app.get("/api/admin/logs")
async def get_audit_logs(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    skip: int = 0,
    limit: int = 50,
    user_id: Optional[int] = None,
    action: Optional[str] = None
):
    """Get audit logs (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    logs = AUDIT_LOGS.copy()
    
    # Apply filters
    if user_id:
        logs = [log for log in logs if log["user_id"] == user_id]
    if action:
        logs = [log for log in logs if log["action"] == action]
    
    # Sort by timestamp (newest first)
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    
    # Pagination
    total = len(logs)
    logs = logs[skip:skip + limit]
    
    return {
        "data": logs,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

@app.get("/api/admin/config")
async def get_system_config(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get system configuration (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    return SYSTEM_CONFIG

@app.put("/api/admin/config")
async def update_system_config(
    config_data: SystemConfigUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update system configuration (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    # Update config
    update_data = config_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            SYSTEM_CONFIG[field] = value
    
    # Log audit event
    log_audit_event(
        admin_user["id"],
        admin_user["name"],
        "config_updated",
        "Updated system configuration"
    )
    
    return SYSTEM_CONFIG

@app.get("/api/admin/roles")
async def get_roles(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get available roles and hierarchy (CEO only)"""
    admin_user = get_user_from_token(credentials)
    check_admin_access(admin_user)
    
    return {
        "roles": [
            {"level": 1, "name": "Founder & CEO", "description": "Full system access"},
            {"level": 2, "name": "Co-Founder", "description": "Near-full access"},
            {"level": 3, "name": "Director", "description": "Department-wide access"},
            {"level": 4, "name": "Project Lead", "description": "Project-level access"},
            {"level": 5, "name": "Agent", "description": "Limited operational access"},
            {"level": 6, "name": "Junior", "description": "Minimal read-only access"},
        ],
        "departments": [
            "Executive",
            "Sales",
            "Finance",
            "Technical",
            "Marketing",
            "Operations"
        ]
    }

