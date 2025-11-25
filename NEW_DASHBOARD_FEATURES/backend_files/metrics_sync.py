"""
Metrics Sync Service
Syncs data from Google Sheets, calculates metrics, and saves to database
"""
from typing import Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from decimal import Decimal

from services.sheets_service import sheets_service
from services.metrics_calculator import metrics_calculator
from services.in_app_notification_service import in_app_notification_service
from models.business_metric import BusinessMetric, MetricHistory
from database.connection import SessionLocal


class MetricsSyncService:
    
    async def sync_all_metrics(self, db: Session = None) -> Dict[str, Any]:
        """
        Main sync function - fetches from Sheets, calculates metrics, saves to DB
        Returns: Dictionary with sync results
        """
        should_close_db = False
        if db is None:
            db = SessionLocal()
            should_close_db = True
        
        try:
            # 1. Fetch data from Google Sheets
            print("📊 Syncing data from Google Sheets...")
            customers = sheets_service.sync_customers()
            expenses = sheets_service.sync_expenses()
            projects = sheets_service.sync_projects()
            strategic = sheets_service.sync_strategic()
            
            print(f"  ✓ Customers: {len(customers)}")
            print(f"  ✓ Expenses: {len(expenses)}")
            print(f"  ✓ Projects: {len(projects)}")
            print(f"  ✓ Strategic data: {len(strategic)} metrics")
            
            # 2. Calculate metrics
            print("\n🧮 Calculating metrics...")
            
            # MRR
            mrr_data = metrics_calculator.calculate_mrr(customers)
            print(f"  ✓ MRR: ${mrr_data['current']:,.2f}")
            
            # CAC
            cac_data = metrics_calculator.calculate_cac(expenses, customers)
            print(f"  ✓ CAC: ${cac_data['current']:,.2f}")
            
            # LTV
            ltv_data = metrics_calculator.calculate_ltv(customers)
            print(f"  ✓ LTV: ${ltv_data['current']:,.2f}")
            
            # QVC
            qvc_data = metrics_calculator.calculate_qvc(projects)
            print(f"  ✓ QVC: ${qvc_data['current']:,.2f}")
            
            # LTGP (needs annual revenue from MRR)
            annual_revenue = mrr_data['current'] * 12
            ltgp_data = metrics_calculator.calculate_ltgp(strategic, annual_revenue)
            print(f"  ✓ LTGP: ${ltgp_data['current']:,.2f}")
            
            # Calculate LTV:CAC ratio
            ltv_cac_ratio = metrics_calculator.calculate_ltv_cac_ratio(
                ltv_data['current'], 
                cac_data['current']
            )
            print(f"  ✓ LTV:CAC Ratio: {ltv_cac_ratio:.1f}:1")
            
            # 3. Save to database
            print("\n💾 Saving to database...")
            
            self._save_metric(db, 'mrr', mrr_data)
            self._save_metric(db, 'cac', cac_data)
            self._save_metric(db, 'ltv', ltv_data)
            self._save_metric(db, 'qvc', qvc_data)
            self._save_metric(db, 'ltgp', ltgp_data)
            
            # 4. Send notifications for significant changes
            print("\n🔔 Checking for significant changes...")
            await self._notify_metric_changes(db, {
                'mrr': mrr_data,
                'cac': cac_data,
                'ltv': ltv_data,
                'qvc': qvc_data,
                'ltgp': ltgp_data
            })
            
            # Save LTV:CAC ratio as metadata in LTV
            ltv_metric = db.query(BusinessMetric).filter(
                BusinessMetric.metric_type == 'ltv'
            ).first()
            if ltv_metric and ltv_metric.meta_data:
                ltv_metric.meta_data['ltv_cac_ratio'] = ltv_cac_ratio
                db.commit()
            
            print("  ✓ All metrics saved")
            
            # 4. Save history
            print("\n📈 Saving history...")
            self._save_history(db, 'mrr', mrr_data['current'], mrr_data)
            self._save_history(db, 'cac', cac_data['current'], cac_data)
            self._save_history(db, 'ltv', ltv_data['current'], ltv_data)
            self._save_history(db, 'qvc', qvc_data['current'], qvc_data)
            self._save_history(db, 'ltgp', ltgp_data['current'], ltgp_data)
            print("  ✓ History saved")
            
            return {
                'success': True,
                'synced_at': datetime.now().isoformat(),
                'metrics': {
                    'mrr': mrr_data['current'],
                    'cac': cac_data['current'],
                    'ltv': ltv_data['current'],
                    'qvc': qvc_data['current'],
                    'ltgp': ltgp_data['current'],
                    'ltv_cac_ratio': ltv_cac_ratio
                },
                'data_counts': {
                    'customers': len(customers),
                    'expenses': len(expenses),
                    'projects': len(projects)
                }
            }
            
        except Exception as e:
            print(f"\n❌ Error during sync: {e}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e),
                'synced_at': datetime.now().isoformat()
            }
        
        finally:
            if should_close_db:
                db.close()
    
    def _save_metric(self, db: Session, metric_type: str, data: Dict[str, Any]):
        """Save or update a metric in the database"""
        # Check if metric exists
        metric = db.query(BusinessMetric).filter(
            BusinessMetric.metric_type == metric_type
        ).first()
        
        current_value = Decimal(str(data.get('current', 0)))
        previous_value = Decimal(str(data.get('previous', 0)))
        change_percentage = Decimal(str(data.get('change_percentage', 0)))
        
        if metric:
            # Update existing
            metric.current_value = current_value
            metric.previous_value = previous_value
            metric.change_percentage = change_percentage
            metric.meta_data = data
            metric.calculated_at = datetime.now()
            metric.updated_at = datetime.now()
        else:
            # Create new
            metric = BusinessMetric(
                metric_type=metric_type,
                current_value=current_value,
                previous_value=previous_value,
                change_percentage=change_percentage,
                meta_data=data,
                calculated_at=datetime.now()
            )
            db.add(metric)
        
        db.commit()
    
    def _save_history(self, db: Session, metric_type: str, value: float, metadata: Dict[str, Any]):
        """Save metric history for trend analysis"""
        history = MetricHistory(
            metric_type=metric_type,
            value=Decimal(str(value)),
            meta_data=metadata,
            recorded_at=datetime.now()
        )
        db.add(history)
        db.commit()
    
    async def _notify_metric_changes(self, db: Session, metrics: Dict[str, Dict[str, Any]]):
        """Send notifications for significant metric changes"""
        
        # Define thresholds and permissions for each metric
        metric_config = {
            'mrr': {
                'name': 'MRR',
                'icon': 'trending-up',
                'permission': 'view_mrr',
                'threshold': 5.0,  # 5% change
                'emoji': '📈'
            },
            'cac': {
                'name': 'CAC',
                'icon': 'dollar-sign',
                'permission': 'view_cac',
                'threshold': 10.0,  # 10% change
                'emoji': '💰'
            },
            'ltv': {
                'name': 'LTV',
                'icon': 'trending-up',
                'permission': 'view_ltv',
                'threshold': 5.0,
                'emoji': '💎'
            },
            'qvc': {
                'name': 'QVC',
                'icon': 'bar-chart',
                'permission': 'view_qvc',
                'threshold': 10.0,
                'emoji': '📊'
            },
            'ltgp': {
                'name': 'LTGP',
                'icon': 'target',
                'permission': 'view_ltgp',
                'threshold': 5.0,
                'emoji': '🎯'
            }
        }
        
        for metric_type, data in metrics.items():
            if metric_type not in metric_config:
                continue
            
            config = metric_config[metric_type]
            change_pct = abs(data.get('change_percentage', 0))
            
            # Only notify if change exceeds threshold
            if change_pct >= config['threshold']:
                current = data.get('current', 0)
                change = data.get('change_percentage', 0)
                
                # Determine color based on direction
                if metric_type == 'cac':
                    # For CAC, decrease is good
                    color = 'green' if change < 0 else 'red'
                else:
                    # For others, increase is good
                    color = 'green' if change > 0 else 'red'
                
                # Format message
                direction = '↑' if change > 0 else '↓'
                title = f"{config['emoji']} {config['name']} {direction} {abs(change):.1f}%"
                message = f"{config['name']} is now ${current:,.2f} ({'+' if change > 0 else ''}{change:.1f}%)"
                
                try:
                    await in_app_notification_service.create_notification(
                        title=title,
                        message=message,
                        notification_type="metric_update",
                        icon=config['icon'],
                        color=color,
                        required_permission=config['permission'],  # Only users with this permission
                        related_metric=metric_type,
                        data={
                            'metric_type': metric_type,
                            'current_value': current,
                            'previous_value': data.get('previous', 0),
                            'change_percentage': change,
                            'threshold': config['threshold']
                        },
                        send_to_discord=False,  # Metrics are sensitive, don't send to Discord
                        db=db
                    )
                    print(f"  ✓ Notification sent for {config['name']} ({change:+.1f}%)")
                except Exception as e:
                    print(f"  ✗ Failed to send notification for {config['name']}: {e}")


# Singleton instance
metrics_sync_service = MetricsSyncService()
