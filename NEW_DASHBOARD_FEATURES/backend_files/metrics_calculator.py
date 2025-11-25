"""
Metrics Calculator Service
Calculates business metrics (MRR, CAC, LTV, QVC, LTGP) from Google Sheets data
"""
from typing import List, Dict, Any
from datetime import datetime, timedelta
from decimal import Decimal


class MetricsCalculator:
    
    @staticmethod
    def calculate_mrr(customers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate Monthly Recurring Revenue and components"""
        # Filter active customers
        active_customers = [c for c in customers if c.get('status') == 'Active']
        
        # Current MRR
        current_mrr = sum(c.get('mrr', 0) for c in active_customers)
        
        # New MRR (customers who started this month)
        current_month = datetime.now().strftime('%Y-%m')
        new_customers = [
            c for c in active_customers 
            if c.get('start_date', '').startswith(current_month)
        ]
        new_mrr = sum(c.get('mrr', 0) for c in new_customers)
        
        # Churned MRR (customers who churned this month)
        churned_customers = [
            c for c in customers 
            if c.get('status') == 'Churned'
        ]
        # Note: We don't have churn date, so this is approximate
        churned_mrr = sum(c.get('mrr', 0) for c in churned_customers[-3:])  # Last 3 churned
        
        # Calculate change
        previous_mrr = current_mrr - new_mrr + churned_mrr
        change_percentage = ((current_mrr - previous_mrr) / previous_mrr * 100) if previous_mrr > 0 else 0
        
        return {
            'current': float(current_mrr),
            'previous': float(previous_mrr),
            'change_percentage': float(change_percentage),
            'new_mrr': float(new_mrr),
            'churned_mrr': float(churned_mrr),
            'net_change': float(new_mrr - churned_mrr),
            'active_customers': len(active_customers),
            'new_customers': len(new_customers),
            'churned_customers': len(churned_customers)
        }
    
    @staticmethod
    def calculate_cac(expenses: List[Dict[str, Any]], customers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate Customer Acquisition Cost"""
        # Get current month expenses
        current_month = datetime.now().strftime('%Y-%m')
        current_month_expenses = [
            e for e in expenses 
            if e.get('date', '').startswith(current_month)
        ]
        
        # Sum marketing and sales costs
        marketing_spend = sum(
            e.get('amount', 0) for e in current_month_expenses 
            if e.get('category') == 'Marketing'
        )
        sales_cost = sum(
            e.get('amount', 0) for e in current_month_expenses 
            if e.get('category') == 'Sales Cost'
        )
        total_spend = marketing_spend + sales_cost
        
        # Count new customers this month
        new_customers = [
            c for c in customers 
            if c.get('start_date', '').startswith(current_month) and c.get('status') == 'Active'
        ]
        new_customer_count = len(new_customers)
        
        # Calculate CAC
        cac = (total_spend / new_customer_count) if new_customer_count > 0 else 0
        
        # Calculate previous month for comparison
        prev_month = (datetime.now().replace(day=1) - timedelta(days=1)).strftime('%Y-%m')
        prev_month_expenses = [
            e for e in expenses 
            if e.get('date', '').startswith(prev_month)
        ]
        prev_marketing = sum(
            e.get('amount', 0) for e in prev_month_expenses 
            if e.get('category') == 'Marketing'
        )
        prev_sales = sum(
            e.get('amount', 0) for e in prev_month_expenses 
            if e.get('category') == 'Sales Cost'
        )
        prev_total = prev_marketing + prev_sales
        
        prev_new_customers = [
            c for c in customers 
            if c.get('start_date', '').startswith(prev_month) and c.get('status') == 'Active'
        ]
        prev_cac = (prev_total / len(prev_new_customers)) if prev_new_customers else 0
        
        change_percentage = ((cac - prev_cac) / prev_cac * 100) if prev_cac > 0 else 0
        
        return {
            'current': float(cac),
            'previous': float(prev_cac),
            'change_percentage': float(change_percentage),
            'marketing_spend': float(marketing_spend),
            'sales_cost': float(sales_cost),
            'total_spend': float(total_spend),
            'new_customers': new_customer_count
        }
    
    @staticmethod
    def calculate_ltv(customers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate Lifetime Value"""
        active_customers = [c for c in customers if c.get('status') == 'Active']
        
        if not active_customers:
            return {
                'current': 0,
                'avg_mrr': 0,
                'avg_duration': 0,
                'churn_rate': 0
            }
        
        # Average MRR per customer
        avg_mrr = sum(c.get('mrr', 0) for c in active_customers) / len(active_customers)
        
        # Average plan duration
        avg_duration = sum(c.get('plan_duration', 12) for c in active_customers) / len(active_customers)
        
        # Simple LTV calculation
        ltv = avg_mrr * avg_duration
        
        # Calculate churn rate
        total_customers = len(customers)
        churned_customers = len([c for c in customers if c.get('status') == 'Churned'])
        churn_rate = (churned_customers / total_customers * 100) if total_customers > 0 else 0
        
        # Advanced LTV (if we had gross margin)
        # ltv_advanced = (avg_mrr * gross_margin) / (churn_rate / 100)
        
        return {
            'current': float(ltv),
            'avg_mrr': float(avg_mrr),
            'avg_duration': float(avg_duration),
            'churn_rate': float(churn_rate),
            'total_customers': total_customers,
            'active_customers': len(active_customers),
            'churned_customers': churned_customers
        }
    
    @staticmethod
    def calculate_qvc(projects: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate Quarterly Value Created"""
        # Get current quarter
        now = datetime.now()
        quarter = (now.month - 1) // 3 + 1
        quarter_start = datetime(now.year, (quarter - 1) * 3 + 1, 1)
        
        # Filter projects completed this quarter
        quarter_projects = []
        for p in projects:
            try:
                completion_date = datetime.strptime(p.get('completion_date', ''), '%Y-%m-%d')
                if completion_date >= quarter_start:
                    quarter_projects.append(p)
            except (ValueError, TypeError):
                continue
        
        # Calculate total value
        total_value = sum(p.get('value_amount', 0) for p in quarter_projects)
        
        # Break down by value type
        by_type = {}
        for p in quarter_projects:
            vtype = p.get('value_type', 'Other')
            by_type[vtype] = by_type.get(vtype, 0) + p.get('value_amount', 0)
        
        # Calculate average per project
        avg_per_project = total_value / len(quarter_projects) if quarter_projects else 0
        
        # Find top client
        by_client = {}
        for p in quarter_projects:
            client = p.get('client_name', 'Unknown')
            by_client[client] = by_client.get(client, 0) + p.get('value_amount', 0)
        
        top_client = max(by_client.items(), key=lambda x: x[1]) if by_client else ('None', 0)
        
        return {
            'current': float(total_value),
            'projects_count': len(quarter_projects),
            'by_type': {k: float(v) for k, v in by_type.items()},
            'avg_per_project': float(avg_per_project),
            'top_client': top_client[0],
            'top_client_value': float(top_client[1]),
            'quarter': f'Q{quarter} {now.year}'
        }
    
    @staticmethod
    def calculate_ltgp(strategic_data: Dict[str, Any], current_revenue: float) -> Dict[str, Any]:
        """Calculate Long-Term Growth Potential"""
        # Extract strategic data
        tam = float(strategic_data.get('TAM (Total Market)', 0))
        sam = float(strategic_data.get('SAM (Serviceable Market)', 0))
        growth_probability = float(strategic_data.get('Growth Probability', 0.3))
        
        # Calculate penetration
        penetration = (current_revenue / sam * 100) if sam > 0 else 0
        
        # Calculate LTGP score
        ltgp_score = (sam - current_revenue) * growth_probability
        
        # Calculate runway (how much room to grow)
        runway = sam - current_revenue
        
        return {
            'current': float(ltgp_score),
            'tam': float(tam),
            'sam': float(sam),
            'current_revenue': float(current_revenue),
            'penetration': float(penetration),
            'growth_probability': float(growth_probability * 100),  # Convert to percentage
            'runway': float(runway)
        }
    
    @staticmethod
    def calculate_ltv_cac_ratio(ltv: float, cac: float) -> float:
        """Calculate LTV:CAC ratio (target: 3:1 or higher)"""
        return (ltv / cac) if cac > 0 else 0


# Singleton instance
metrics_calculator = MetricsCalculator()
