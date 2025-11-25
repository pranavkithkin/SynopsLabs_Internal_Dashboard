# User Hierarchy & Setup

## 👥 Team Structure

### Organizational Hierarchy

```
TRART Organization
│
├── Pranav (CEO & Founder)
│   ├── Full access to all features
│   ├── Can manage all permissions
│   └── Can view all metrics and KPIs
│
├── Fazil (Co-Founder)
│   ├── Full access to all features
│   ├── Can manage team permissions
│   └── Can view all metrics and KPIs
│
├── Thameem (Co-Founder)
│   ├── Full access to all features
│   ├── Can manage team permissions
│   └── Can view all metrics and KPIs
│
└── Suhail (Sales Agent)
    ├── Sales-focused access
    ├── Can view sales KPIs
    ├── Can use Alfred for sales tasks
    └── Limited metrics access (MRR, CAC)
```

## 🎯 Role Definitions

### CEO & Founder (Pranav)
**Role**: `ceo`

**Permissions**:
- ✅ All permissions enabled
- ✅ Full Alfred access
- ✅ All metrics (MRR, CAC, LTV, QVC, LTGP)
- ✅ All KPIs (Sales, Marketing, Operations, Finance)
- ✅ User management
- ✅ Permission management
- ✅ System configuration

**Use Cases**:
- Strategic decision making
- Financial oversight
- Team management
- System administration

---

### Co-Founder (Fazil, Thameem)
**Role**: `co-founder`

**Permissions**:
- ✅ All permissions enabled (same as CEO)
- ✅ Full Alfred access
- ✅ All metrics (MRR, CAC, LTV, QVC, LTGP)
- ✅ All KPIs (Sales, Marketing, Operations, Finance)
- ✅ User management
- ✅ Permission management
- ⚠️ Cannot delete CEO account

**Use Cases**:
- Strategic planning
- Team leadership
- Business development
- Operations management

---

### Sales Agent (Suhail)
**Role**: `sales_agent`

**Permissions**:
- ✅ Alfred chat access
- ✅ Sales KPIs (daily, weekly, monthly)
- ✅ Limited metrics:
  - MRR (view only)
  - CAC (view only)
- ✅ Create tasks
- ✅ Schedule meetings
- ✅ Send messages (WhatsApp, Telegram)
- ✅ Add customers to Google Sheets
- ✅ View own performance metrics
- ❌ Finance KPIs
- ❌ Operations KPIs
- ❌ LTV, QVC, LTGP metrics
- ❌ User management
- ❌ Permission management

**Use Cases**:
- Daily sales activities
- Customer relationship management
- Sales pipeline tracking
- Performance monitoring

---

## 📊 Permission Matrix

| Feature | CEO | Co-Founder | Sales Agent |
|---------|-----|------------|-------------|
| **Alfred AI** |
| Chat with Alfred | ✅ | ✅ | ✅ |
| Create tasks via Alfred | ✅ | ✅ | ✅ |
| Schedule meetings | ✅ | ✅ | ✅ |
| Send messages | ✅ | ✅ | ✅ |
| Add customers | ✅ | ✅ | ✅ |
| Add expenses | ✅ | ✅ | ❌ |
| **Metrics** |
| View MRR | ✅ | ✅ | ✅ |
| View CAC | ✅ | ✅ | ✅ |
| View LTV | ✅ | ✅ | ❌ |
| View QVC | ✅ | ✅ | ❌ |
| View LTGP | ✅ | ✅ | ❌ |
| Export metrics | ✅ | ✅ | ❌ |
| Manual entry | ✅ | ✅ | ❌ |
| **KPIs** |
| Sales KPIs | ✅ | ✅ | ✅ |
| Marketing KPIs | ✅ | ✅ | ❌ |
| Operations KPIs | ✅ | ✅ | ❌ |
| Finance KPIs | ✅ | ✅ | ❌ |
| Create KPIs | ✅ | ✅ | ❌ |
| Set targets | ✅ | ✅ | ❌ |
| **Admin** |
| User management | ✅ | ✅ | ❌ |
| Permission management | ✅ | ✅ | ❌ |
| System settings | ✅ | ✅ | ❌ |

## 🔧 User Setup SQL

See `create_users.sql` for the SQL script to create these users.

## 📝 User Details

### Pranav (CEO & Founder)
- **Email**: pranav@trart.com
- **Role**: CEO
- **Department**: Executive
- **Permissions**: All enabled

### Fazil (Co-Founder)
- **Email**: fazil@trart.com
- **Role**: Co-Founder
- **Department**: Executive
- **Permissions**: All enabled

### Thameem (Co-Founder)
- **Email**: thameem@trart.com
- **Role**: Co-Founder
- **Department**: Executive
- **Permissions**: All enabled

### Suhail (Sales Agent)
- **Email**: suhail@trart.com
- **Role**: Sales Agent
- **Department**: Sales
- **Permissions**: Sales-focused

## 🚀 Setup Instructions

### 1. Create Users

```bash
# Run the SQL script
psql -U your_user -d your_database -f create_users.sql
```

### 2. Verify Users

```sql
-- Check users were created
SELECT id, name, email, role, department FROM users;
```

### 3. Verify Permissions

```sql
-- Check CEO has all permissions
SELECT * FROM user_permissions WHERE user_id = (SELECT id FROM users WHERE email = 'pranav@trart.com');

-- Check sales agent has limited permissions
SELECT * FROM user_permissions WHERE user_id = (SELECT id FROM users WHERE email = 'suhail@trart.com');
```

### 4. Test Login

Test each user can log in and see appropriate features.

## 🔐 Security Notes

1. **Password Security**: Change default passwords immediately
2. **2FA**: Enable two-factor authentication for all users
3. **Session Management**: Set appropriate session timeouts
4. **Audit Logging**: Track all permission changes
5. **Regular Reviews**: Review permissions quarterly

## 📈 Scaling the Team

When adding new users:

1. **Determine Role**: CEO, Co-Founder, Manager, Sales Agent, etc.
2. **Set Permissions**: Use role defaults or customize
3. **Assign Department**: For organizational clarity
4. **Onboard**: Provide training on available features
5. **Monitor**: Track usage and adjust permissions as needed

## 💡 Best Practices

1. **Principle of Least Privilege**: Give users only what they need
2. **Regular Audits**: Review permissions quarterly
3. **Clear Communication**: Inform users of their access level
4. **Training**: Ensure users understand their permissions
5. **Feedback Loop**: Adjust permissions based on user needs

## 🎯 Example Workflows

### Pranav (CEO) Workflow
1. Morning: Check all KPIs dashboard
2. Review Alfred insights on business metrics
3. Analyze MRR, CAC, LTV trends
4. Make strategic decisions
5. Manage team permissions as needed

### Fazil/Thameem (Co-Founder) Workflow
1. Review relevant department KPIs
2. Use Alfred for task management
3. Monitor team performance
4. Collaborate on strategic initiatives
5. Manage team members

### Suhail (Sales Agent) Workflow
1. Check daily sales KPIs
2. Ask Alfred about sales targets
3. Add new customers via Alfred
4. Schedule meetings with prospects
5. Track personal performance metrics
