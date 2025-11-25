#!/usr/bin/env python3
"""
Quick script to inspect Google Sheet structure and current data
"""
import sys
import os
sys.path.append('/Users/pranav/MY_PROJECTS/TRART_PROJECTS/Whatsapp_chatbot_BusinessSetupCompany/TRART/0004_Dashboard/backend')

from services.sheets import sheets_service
import asyncio
import json

async def inspect_sheets():
    print("=" * 80)
    print("GOOGLE SHEET INSPECTION")
    print("=" * 80)
    
    # Test Customers tab
    print("\n📊 CUSTOMERS TAB")
    print("-" * 80)
    try:
        customers = await sheets_service.get_customers()
        if customers:
            print(f"✅ Found {len(customers)} customers")
            print(f"Headers: {list(customers[0].keys())}")
            print(f"\nFirst customer sample:")
            print(json.dumps(customers[0], indent=2))
        else:
            print("⚠️  No customer data found")
            # Try to read raw range to see headers
            raw = await sheets_service.read_range('Customers!A1:Z1')
            if raw:
                print(f"Raw headers found: {raw[0]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test Expenses tab
    print("\n\n💰 EXPENSES TAB")
    print("-" * 80)
    try:
        expenses = await sheets_service.get_expenses()
        if expenses:
            print(f"✅ Found {len(expenses)} expenses")
            print(f"Headers: {list(expenses[0].keys())}")
            print(f"\nFirst expense sample:")
            print(json.dumps(expenses[0], indent=2))
        else:
            print("⚠️  No expense data found")
            raw = await sheets_service.read_range('Expenses!A1:Z1')
            if raw:
                print(f"Raw headers found: {raw[0]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test Projects tab
    print("\n\n🚀 PROJECTS TAB")
    print("-" * 80)
    try:
        projects = await sheets_service.get_projects()
        if projects:
            print(f"✅ Found {len(projects)} projects")
            print(f"Headers: {list(projects[0].keys())}")
            print(f"\nFirst project sample:")
            print(json.dumps(projects[0], indent=2))
        else:
            print("⚠️  No project data found")
            raw = await sheets_service.read_range('Projects!A1:Z1')
            if raw:
                print(f"Raw headers found: {raw[0]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test Monthly Snapshots tab
    print("\n\n📈 MONTHLY SNAPSHOTS TAB")
    print("-" * 80)
    try:
        snapshots = await sheets_service.get_monthly_snapshots()
        if snapshots:
            print(f"✅ Found {len(snapshots)} snapshots")
            print(f"Headers: {list(snapshots[0].keys())}")
            print(f"\nFirst snapshot sample:")
            print(json.dumps(snapshots[0], indent=2))
        else:
            print("⚠️  No snapshot data found")
            raw = await sheets_service.read_range('Monthly_Snapshots!A1:Z1')
            if raw:
                print(f"Raw headers found: {raw[0]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 80)
    print("INSPECTION COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(inspect_sheets())
