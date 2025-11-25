# Alfred AI - Permission-Aware AI Assistant

## 🤖 What is Alfred?

Alfred is a high-quality AI assistant integrated into your dashboard that provides intelligent, permission-aware responses to users. Alfred acts as a virtual team member who understands:

- **User's role and permissions**: Only shows data the user can access
- **Dashboard context**: Aware of user's current metrics, notifications, and integrations
- **Natural conversation**: Talks like a friendly colleague, not a formal bot
- **Action execution**: Can create tasks, schedule meetings, send messages, and more

## 🎯 Key Features

### 1. Permission-Aware Responses

Alfred respects the user's permission level and only provides information they have access to.

**Example Scenarios:**

#### Scenario 1: User with MRR Permission
```
User: "What's our MRR this month?"
Alfred: "Our MRR this month is $45,230, up 12.5% from last month! 🎉"
```

#### Scenario 2: User WITHOUT MRR Permission
```
User: "What's our MRR this month?"
Alfred: "Sorry, you don't have permission to view MRR data. Please contact your CEO if you need access to this metric."
```

#### Scenario 3: CEO (Full Access)
```
User: "Show me all our metrics"
Alfred: "Here's a complete overview:
- MRR: $45,230 (↑12.5%)
- CAC: $1,250 (↓8.3%)
- LTV: $15,000 (↑5.2%)
- QVC: $125,000 this quarter
- LTGP Score: 8.5/10"
```

### 2. Function Calling Capabilities

Alfred can execute actions on behalf of the user:

#### Create Tasks
```
User: "Create a task to review Q4 metrics"
Alfred: "I'll create that task for you. What priority should I set?"
User: "High priority"
Alfred: "Perfect! I've created a high-priority task 'Review Q4 metrics' for you."
```

#### Schedule Meetings
```
User: "Schedule a team sync tomorrow at 2pm"
Alfred: "I'll schedule 'Team Sync' for tomorrow at 2pm. How long should it run?"
User: "1 hour"
Alfred: "Done! I've scheduled Team Sync for tomorrow at 2pm for 1 hour. I've also sent calendar invites to the team."
```

#### Query Metrics
```
User: "How's our CAC trending?"
Alfred: "Your CAC is currently $1,250, down 8.3% from last month. That's great news - you're acquiring customers more efficiently! The decrease is mainly due to improved marketing ROI."
```

### 3. Conversational Intelligence

Alfred maintains context throughout the conversation:

```
User: "Schedule a meeting about the dashboard redesign"
Alfred: "Sure! When would you like to have it?"
User: "Tomorrow at 3pm"
Alfred: "Great! How long should it run?"
User: "30 minutes"
Alfred: "Perfect! I've scheduled 'Dashboard Redesign' for tomorrow at 3pm for 30 minutes."
```

Notice how Alfred:
- Remembers the meeting topic from the first message
- Asks follow-up questions naturally
- Doesn't ask for information already provided

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                    (Chat Component)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Alfred Router                            │
│                   (API Endpoint)                             │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Alfred Service                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Get user permissions                              │  │
│  │  2. Fetch accessible metrics                          │  │
│  │  3. Build context (integrations, notifications)       │  │
│  │  4. Call OpenAI with context                          │  │
│  │  5. Execute function calls if needed                  │  │
│  │  6. Return permission-filtered response               │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Permission   │   │   Metrics    │   │   OpenAI     │
│  Service     │   │   Service    │   │     API      │
└──────────────┘   └──────────────┘   └──────────────┘
```

### Permission Flow

```python
# 1. Check user permissions
permissions = permission_service.get_user_effective_permissions(user_id)

# 2. Filter metrics based on permissions
accessible_metrics = {}
for metric_type in ["mrr", "cac", "ltv", "qvc", "ltgp"]:
    if permissions.get(f"metrics.{metric_type}.view"):
        accessible_metrics[metric_type] = get_metric_data(metric_type)

# 3. Build context for Alfred
context = {
    "integrations": user_integrations,
    "metrics": accessible_metrics,  # Only accessible metrics
    "notifications": recent_notifications
}

# 4. Alfred uses this context to respond appropriately
```

## 🔧 Implementation Details

### Backend Files Required

1. **`services/alfred_service.py`** - Main Alfred service
   - OpenAI integration
   - Function calling logic
   - Permission checking
   - Context building

2. **`routers/alfred.py`** - API endpoints
   - `/api/alfred/chat` - Send message to Alfred
   - `/api/alfred/sessions` - Get conversation history
   - `/api/alfred/sessions/{id}` - Get specific conversation

3. **`models/alfred_session.py`** - Database model
   - Store conversation history
   - Track user sessions

### Key Functions

#### `get_system_prompt()`
Builds the system prompt with user context:
```python
def get_system_prompt(user_name, user_role, context):
    """
    Creates a personalized system prompt that includes:
    - User's role and permissions
    - Accessible metrics with current values
    - Connected integrations
    - Recent notifications
    - Personality guidelines
    """
```

#### `check_metric_permission()`
Verifies user has access to requested metric:
```python
async def check_metric_permission(user_id, metric_type):
    """
    Returns True if user can view the metric, False otherwise
    CEO always returns True
    """
```

#### `execute_function()`
Executes function calls from OpenAI:
```python
async def execute_function(function_name, arguments, user_id, db):
    """
    Handles:
    - create_task
    - schedule_meeting
    - send_whatsapp_message
    - send_telegram_message
    - get_analytics
    - add_customer
    - add_expense
    - add_project
    - get_metrics
    """
```

## 📊 Permission Integration

### Permission Keys for Alfred

```python
# Metrics permissions
"metrics.mrr.view"      # Can view MRR
"metrics.cac.view"      # Can view CAC
"metrics.ltv.view"      # Can view LTV
"metrics.qvc.view"      # Can view QVC
"metrics.ltgp.view"     # Can view LTGP

# Feature permissions
"alfred.chat"           # Can use Alfred
"tasks.create"          # Can create tasks via Alfred
"meetings.schedule"     # Can schedule meetings via Alfred
```

### Permission Hierarchy

1. **CEO**: All permissions = True
2. **User-specific override**: Custom permissions for individual users
3. **Role default**: Default permissions for the user's role
4. **System default**: False (no access)

## 🎨 Frontend Integration

### Chat Component Example

```typescript
// Chat with Alfred
const sendMessage = async (message: string) => {
  const response = await fetch('/api/alfred/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_id: currentConversationId
    })
  });
  
  const data = await response.json();
  // data.response - Alfred's response
  // data.conversation_id - Session ID
  // data.function_calls - Any actions taken
};
```

## 🔐 Security Considerations

1. **Never bypass permissions**: Always check permissions before showing data
2. **Validate function calls**: Ensure user has permission to execute actions
3. **Sanitize inputs**: Prevent injection attacks
4. **Rate limiting**: Prevent API abuse
5. **Audit logging**: Track all Alfred interactions

## 💡 Best Practices

### For Developers

1. **Always test with different permission levels**
   - Test as CEO (full access)
   - Test as regular user (limited access)
   - Test with no permissions

2. **Keep context concise**
   - Only include relevant metrics
   - Limit notification history
   - Don't overload the prompt

3. **Handle errors gracefully**
   - OpenAI API failures
   - Permission errors
   - Database errors

### For Users

1. **Be conversational**: Talk to Alfred naturally
2. **Provide context**: Give Alfred enough information
3. **Ask follow-ups**: Alfred remembers the conversation
4. **Check permissions**: If Alfred can't help, you may need access

## 🚀 Getting Started

1. **Set up OpenAI API key** in environment variables
2. **Copy backend files** to your new dashboard
3. **Configure permissions** for your users
4. **Test thoroughly** with different permission levels
5. **Integrate frontend** chat component
6. **Deploy and monitor** usage

## 📈 Future Enhancements

- Voice input/output
- Multi-language support
- Custom function plugins
- Advanced analytics on Alfred usage
- Proactive suggestions
- Integration with more tools
