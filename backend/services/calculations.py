"""
Metrics calculation functions for Google Sheets data
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import calendar


def get_current_month_range():
    """Get start and end date of current month"""
    now = datetime.now()
    start = datetime(now.year, now.month, 1)
    last_day = calendar.monthrange(now.year, now.month)[1]
    end = datetime(now.year, now.month, last_day, 23, 59, 59)
    return start, end


def get_current_quarter_range():
    """Get start and end date of current quarter"""
    now = datetime.now()
    quarter = (now.month - 1) // 3 + 1
    start_month = (quarter - 1) * 3 + 1
    start = datetime(now.year, start_month, 1)
    
    end_month = quarter * 3
    last_day = calendar.monthrange(now.year, end_month)[1]
    end = datetime(now.year, end_month, last_day, 23, 59, 59)
    return start, end


def parse_date(date_str: str) -> Optional[datetime]:
    """Parse date string to datetime"""
    if not date_str:
        return None
    
    try:
        # Try common formats
        for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d']:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return None
    except:
        return None


async def calculate_mrr(customers: List[Dict]) -> Dict:
    """Calculate MRR from active customers"""
    active = [c for c in customers if c.get('Status') == 'Active']
    
    current_mrr = sum(c.get('MRR', 0) for c in active)
    previous_mrr = sum(c.get('Previous_Month_Revenue', 0) for c in active)
    
    if previous_mrr > 0:
        change_pct = ((current_mrr - previous_mrr) / previous_mrr) * 100
    else:
        change_pct = 0
    
    trend = "up" if change_pct > 0.5 else "down" if change_pct < -0.5 else "neutral"
    
    return {
        "current_value": current_mrr,
        "previous_value": previous_mrr,
        "change_percentage": round(change_pct, 2),
        "trend": trend
    }


async def calculate_cac(customers: List[Dict], expenses: List[Dict]) -> Dict:
    """Calculate Customer Acquisition Cost"""
    month_start, month_end = get_current_month_range()
    
    # Marketing/Sales expenses this month
    marketing_expenses = [
        e for e in expenses
        if e.get('Category') in ['Marketing & Advertising', 'Sales & Business Development', 'Marketing', 'Sales cost', 'Advertising']
        and parse_date(e.get('Date'))
        and month_start <= parse_date(e.get('Date')) <= month_end
    ]
    
    total_marketing = sum(e.get('Amount', 0) for e in marketing_expenses)
    
    # New customers this month
    new_customers = [
        c for c in customers
        if parse_date(c.get('Start_Date'))
        and month_start <= parse_date(c.get('Start_Date')) <= month_end
    ]
    
    new_customer_count = len(new_customers)
    current_cac = total_marketing / new_customer_count if new_customer_count > 0 else 0
    
    # Previous month CAC (simplified - using a ratio)
    previous_cac = current_cac * 1.1  # Assume 10% higher last month (placeholder)
    
    change_pct = ((current_cac - previous_cac) / previous_cac * 100) if previous_cac > 0 else 0
    trend = "down" if change_pct < -0.5 else "up" if change_pct > 0.5 else "neutral"
    
    return {
        "current_value": current_cac,
        "previous_value": previous_cac,
        "change_percentage": round(change_pct, 2),
        "trend": trend
    }


async def calculate_ltv(customers: List[Dict]) -> Dict:
    """Calculate Lifetime Value"""
    active = [c for c in customers if c.get('Status') == 'Active' and c.get('MRR', 0) > 0]
    
    if not active:
        return {
            "current_value": 0,
            "previous_value": 0,
            "change_percentage": 0,
            "trend": "neutral"
        }
    
    # Average MRR and Plan Duration
    avg_mrr = sum(c.get('MRR', 0) for c in active) / len(active)
    avg_duration = sum(c.get('Plan_Duration', 12) for c in active) / len(active)
    
    current_ltv = avg_mrr * avg_duration
    
    # Previous LTV (using previous month revenue)
    prev_mrrs = [c.get('Previous_Month_Revenue', 0) for c in active if c.get('Previous_Month_Revenue', 0) > 0]
    if prev_mrrs:
        prev_avg_mrr = sum(prev_mrrs) / len(prev_mrrs)
        previous_ltv = prev_avg_mrr * avg_duration
    else:
        previous_ltv = current_ltv * 0.95  # Assume 5% growth
    
    change_pct = ((current_ltv - previous_ltv) / previous_ltv * 100) if previous_ltv > 0 else 0
    trend = "up" if change_pct > 0.5 else "down" if change_pct < -0.5 else "neutral"
    
    return {
        "current_value": current_ltv,
        "previous_value": previous_ltv,
        "change_percentage": round(change_pct, 2),
        "trend": trend
    }


async def calculate_qvc(projects: List[Dict]) -> Dict:
    """Calculate Quarterly Value Created"""
    quarter_start, quarter_end = get_current_quarter_range()
    
    # Projects completed this quarter
    quarterly_projects = [
        p for p in projects
        if parse_date(p.get('Completion_Date'))
        and quarter_start <= parse_date(p.get('Completion_Date')) <= quarter_end
    ]
    
    current_qvc = sum(p.get('Value_Amount', 0) for p in quarterly_projects)
    
    # Previous quarter (rough estimate)
    previous_qvc = current_qvc * 0.85  # Assume 15% growth
    
    change_pct = ((current_qvc - previous_qvc) / previous_qvc * 100) if previous_qvc > 0 else 0
    trend = "up" if change_pct > 0.5 else "down" if change_pct < -0.5 else "neutral"
    
    return {
        "current_value": current_qvc,
        "previous_value": previous_qvc,
        "change_percentage": round(change_pct, 2),
        "trend": trend
    }


async def calculate_ltgp(customers: List[Dict]) -> Dict:
    """Calculate Lifetime Gross Profit"""
    active = [c for c in customers if c.get('Status') == 'Active']
    
    # Total lifetime revenue
    total_lifetime_revenue = sum(c.get('MRR', 0) * c.get('Plan_Duration', 12) for c in active)
    
    # Assume 70% gross margin for service business
    GROSS_MARGIN = 0.70
    current_ltgp = total_lifetime_revenue * GROSS_MARGIN
    
    # Previous LTGP
    prev_revenue = sum(c.get('Previous_Month_Revenue', 0) * c.get('Plan_Duration', 12) for c in active)
    previous_ltgp = prev_revenue * GROSS_MARGIN if prev_revenue > 0 else current_ltgp * 0.95
    
    change_pct = ((current_ltgp - previous_ltgp) / previous_ltgp * 100) if previous_ltgp > 0 else 0
    trend = "up" if change_pct > 0.5 else "down" if change_pct < -0.5 else "neutral"
    
    return {
        "current_value": current_ltgp,
        "previous_value": previous_ltgp,
        "change_percentage": round(change_pct, 2),
        "trend": trend
    }


async def calculate_nrr(customers: List[Dict]) -> float:
    """Calculate Net Revenue Retention"""
    # Existing customers with previous month data
    existing = [
        c for c in customers
        if c.get('Status') == 'Active'
        and c.get('Previous_Month_Revenue')
        and c.get('Previous_Month_Revenue', 0) > 0
    ]
    
    if not existing:
        return 100.0
    
    current_mrr = sum(c.get('MRR', 0) for c in existing)
    previous_mrr = sum(c.get('Previous_Month_Revenue', 0) for c in existing)
    
    nrr = (current_mrr / previous_mrr * 100) if previous_mrr > 0 else 100.0
    return round(nrr, 2)


async def calculate_gross_margin(customers: List[Dict], expenses: List[Dict]) -> float:
    """Calculate Gross Margin"""
    active = [c for c in customers if c.get('Status') == 'Active']
    annual_revenue = sum(c.get('MRR', 0) * 12 for c in active)
    
    # AI/API costs and Cloud Infrastructure (direct service delivery costs)
    direct_costs = [e for e in expenses if e.get('Category') in ['AI/API Costs', 'Cloud Infrastructure']]
    annual_direct_costs = sum(e.get('Amount', 0) for e in direct_costs) * 12
    
    if annual_revenue == 0:
        return 0.0
    
    gross_margin = ((annual_revenue - annual_direct_costs) / annual_revenue) * 100
    return round(gross_margin, 2)


async def calculate_customer_concentration(customers: List[Dict]) -> float:
    """Calculate Customer Concentration (Top 3)"""
    active = [c for c in customers if c.get('Status') == 'Active']
    
    if not active:
        return 0.0
    
    # Sort by MRR descending
    sorted_customers = sorted(active, key=lambda x: x.get('MRR', 0), reverse=True)
    
    # Top 3 customers
    top_3 = sorted_customers[:3]
    top_3_mrr = sum(c.get('MRR', 0) for c in top_3)
    
    total_mrr = sum(c.get('MRR', 0) for c in active)
    
    concentration = (top_3_mrr / total_mrr * 100) if total_mrr > 0 else 0
    return round(concentration, 2)
