"""
Alfred AI Service - OpenAI Integration with Function Calling
"""
import json
import pytz
from openai import OpenAI
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from config import settings
from models.alfred_session import AlfredSession
from models.api_key import ApiKey
from schemas.alfred import ChatMessage
from services.metrics_service import metrics_service


class AlfredService:
    """Alfred AI service with OpenAI integration"""
    
    def __init__(self):
        # Force reload environment variables to get latest API key
        import os
        from pathlib import Path
        from dotenv import load_dotenv
        
        env_file = Path(__file__).resolve().parent.parent / '.env'
        load_dotenv(env_file, override=True)
        
        # Get fresh API key from environment
        api_key = os.getenv("OPENAI_API_KEY")
        print(f"🔑 API key from environment: {api_key[:20] if api_key else 'NONE'}...")
        
        if api_key and api_key != "sk-placeholder-users-add-their-own":
            self.client = OpenAI(api_key=api_key)
            print("✅ OpenAI client created successfully")
        else:
            self.client = None
            print("⚠️ No valid API key - OpenAI client not created")
        self.model = "gpt-4o"  # Latest GPT-4 Omni model
        
    def get_system_prompt(self, user_name: str, user_role: str, context: Dict[str, Any] = None) -> str:
        """Get system prompt for Alfred with context"""
        context = context or {}
        integrations = context.get('integrations', {})
        metrics = context.get('metrics', {})
        notifications = context.get('notifications', [])
        
        # Format integrations
        connected_services = [k for k, v in integrations.items() if v]
        integrations_text = ", ".join(connected_services) if connected_services else "None"
        
        # Format metrics
        metrics_text = ""
        if metrics:
            metrics_text = "ACCESSIBLE METRICS (Real-time data):\n"
            for k, v in metrics.items():
                val = v.get('current_value')
                if val is not None:
                    # Format currency if applicable
                    if k in ['mrr', 'cac', 'ltv', 'qvc']:
                        val_str = f"${val:,.2f}"
                    else:
                        val_str = str(val)
                    metrics_text += f"- {k.upper()}: {val_str}\n"
        else:
            metrics_text = "You do not have access to business metrics for this user."

        # Format notifications
        notif_text = ""
        if notifications:
            notif_text = "RECENT DASHBOARD NOTIFICATIONS (User is seeing these):\n"
            for n in notifications[:5]: # Limit to 5
                title = n.get('title', 'Notification')
                msg = n.get('message', '')
                notif_text += f"- {title}: {msg}\n"
        else:
            notif_text = "No recent notifications."

        # Format RAG Context
        rag_context = ""
        rag_docs = context.get("rag_docs", [])
        if rag_docs:
            rag_context = "RELEVANT KNOWLEDGE BASE (Use this to answer questions):\n" + "\n".join(
                [f"- {doc.content}" for doc in rag_docs]
            )

        return f"""You are Alfred, a helpful and conversational AI assistant for {user_name} at TRART.

PERSONALITY:
- Talk like a friendly, intelligent colleague - not a formal bot
- Be warm, natural, and conversational
- Use casual language when appropriate
- Show personality and humor when fitting
- Be concise but not robotic
- Use emojis occasionally to add warmth (but don't overdo it)

CURRENT CONTEXT:
User Role: {user_role}
Connected Integrations: {integrations_text}

{metrics_text}

{notif_text}

{rag_context}

CONVERSATION STYLE:
- When user asks to schedule a meeting, have a natural conversation:
  Example: "Sure! Let me help you schedule that. What's the meeting about?"
  Then: "Great! When would you like to have it?"
  Then: "Perfect! How long should it run?"
  
- When creating tasks, be conversational:
  Example: "I'll create that task for you. What priority should I set?"
  
- Don't ask for all information at once in a numbered list
- Ask one or two questions at a time, naturally
- Infer reasonable defaults when possible (e.g., 1 hour for meetings)
- If user gives partial info, work with it and ask for missing pieces conversationally

CAPABILITIES:
You can help with:
- Creating and managing tasks
- Scheduling meetings (with Google Calendar)
- Sending messages via WhatsApp/Telegram
- Providing insights and analytics
- Managing the dashboard

FUNCTION CALLING:
- When you have enough information, use the available functions
- You can infer reasonable defaults (e.g., if no duration mentioned, assume 60 minutes for meetings)
- Always confirm what you're about to do before executing
- Example: "I'll schedule 'Team Sync' for tomorrow at 2pm for an hour. Sound good?"

MEMORY & CONTEXT:
- ALWAYS read the full conversation history before responding
- Remember what the user has already told you in this conversation
- Don't ask for information they've already provided
- Build on previous messages naturally
- Example: If user said "meeting about dashboard" and then "tomorrow at 2pm", you know BOTH facts
- Extract and remember: meeting topics, dates, times, names, preferences

Remember: Be helpful, natural, and human-like. You're Alfred, not a form to fill out. PAY ATTENTION to what user has already told you in the conversation."""

    def get_functions_schema(self) -> List[Dict[str, Any]]:
        """Get OpenAI function calling schema"""
        return [
            {
                "name": "create_task",
                "description": "Create a new task for the user or team",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Task title"
                        },
                        "description": {
                            "type": "string",
                            "description": "Task description"
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["low", "medium", "high", "urgent"],
                            "description": "Task priority"
                        },
                        "due_date": {
                            "type": "string",
                            "description": "Due date in YYYY-MM-DD format"
                        },
                        "assigned_to": {
                            "type": "string",
                            "description": "Email of person to assign to"
                        }
                    },
                    "required": ["title"]
                }
            },
            {
                "name": "schedule_meeting",
                "description": "Schedule a meeting with calendar invite",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "Meeting title"
                        },
                        "description": {
                            "type": "string",
                            "description": "Meeting description or agenda"
                        },
                        "date": {
                            "type": "string",
                            "description": "Meeting date in YYYY-MM-DD format"
                        },
                        "time": {
                            "type": "string",
                            "description": "Meeting time in HH:MM format (24-hour)"
                        },
                        "duration_minutes": {
                            "type": "integer",
                            "description": "Meeting duration in minutes"
                        },
                        "participants": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of participant emails"
                        }
                    },
                    "required": ["title", "date", "time"]
                }
            },
            {
                "name": "send_whatsapp_message",
                "description": "Send a WhatsApp message to someone",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "recipient": {
                            "type": "string",
                            "description": "Recipient name or phone number"
                        },
                        "message": {
                            "type": "string",
                            "description": "Message content"
                        }
                    },
                    "required": ["recipient", "message"]
                }
            },
            {
                "name": "send_telegram_message",
                "description": "Send a Telegram message to someone",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "recipient": {
                            "type": "string",
                            "description": "Recipient username"
                        },
                        "message": {
                            "type": "string",
                            "description": "Message content"
                        }
                    },
                    "required": ["recipient", "message"]
                }
            },
            {
                "name": "get_analytics",
                "description": "Get analytics and insights for a specific metric or time period",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "metric": {
                            "type": "string",
                            "enum": ["tasks", "meetings", "team_activity", "feature_requests", "overall"],
                            "description": "Type of analytics to retrieve"
                        },
                        "time_period": {
                            "type": "string",
                            "enum": ["today", "week", "month", "quarter"],
                            "description": "Time period for analytics"
                        }
                    },
                    "required": ["metric"]
                }
            },
            {
                "name": "add_customer",
                "description": "Add a new customer to the sales tracking sheet. Use this when a sale is closed.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "customer_name": {
                            "type": "string",
                            "description": "Name of the customer/company"
                        },
                        "setup_fee": {
                            "type": "number",
                            "description": "One-time setup fee in dollars"
                        },
                        "mrr": {
                            "type": "number",
                            "description": "Monthly recurring revenue in dollars"
                        },
                        "start_date": {
                            "type": "string",
                            "description": "Start date in YYYY-MM-DD format (default: today)"
                        },
                        "industry": {
                            "type": "string",
                            "description": "Customer's industry (e.g., Technology, Finance, Retail)"
                        },
                        "plan_duration": {
                            "type": "number",
                            "description": "Contract duration in months (default: 12)"
                        }
                    },
                    "required": ["customer_name", "setup_fee", "mrr"]
                }
            },
            {
                "name": "add_expense",
                "description": "Add a business expense for tracking CAC and other costs",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "enum": ["Marketing", "Sales Cost", "Operations", "Other"],
                            "description": "Expense category"
                        },
                        "amount": {
                            "type": "number",
                            "description": "Expense amount in dollars"
                        },
                        "description": {
                            "type": "string",
                            "description": "Description of the expense"
                        },
                        "date": {
                            "type": "string",
                            "description": "Expense date in YYYY-MM-DD format (default: today)"
                        }
                    },
                    "required": ["category", "amount", "description"]
                }
            },
            {
                "name": "add_project",
                "description": "Add a completed project for QVC (Quarterly Value Created) tracking",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "client_name": {
                            "type": "string",
                            "description": "Name of the client"
                        },
                        "project_name": {
                            "type": "string",
                            "description": "Name/title of the project"
                        },
                        "completion_date": {
                            "type": "string",
                            "description": "Project completion date in YYYY-MM-DD format (default: today)"
                        },
                        "documentation_link": {
                            "type": "string",
                            "description": "Link to project documentation"
                        },
                        "value_type": {
                            "type": "string",
                            "enum": ["Cost Savings", "Revenue Increase", "Time Savings", "Strategic"],
                            "description": "Type of value delivered"
                        },
                        "value_amount": {
                            "type": "number",
                            "description": "Quantified value in dollars"
                        }
                    },
                    "required": ["client_name", "project_name", "value_type", "value_amount"]
                }
            },
            {
                "name": "get_metrics",
                "description": "Get current business metrics (MRR, CAC, LTV, QVC, LTGP)",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "metric_type": {
                            "type": "string",
                            "enum": ["mrr", "cac", "ltv", "qvc", "ltgp", "all"],
                            "description": "Which metric to retrieve (or 'all' for summary)"
                        }
                    },
                    "required": ["metric_type"]
                }
            }
        ]
    
    async def chat(
        self,
        message: str,
        user_id: int,
        user_name: str,
        user_role: str,
        conversation_id: Optional[str],
        db: Session,
        dashboard_context: Optional[Dict[str, Any]] = None
    ) -> Tuple[str, str, List[Dict[str, Any]]]:
        """
        Process chat message with OpenAI and function calling
        
        Returns:
            Tuple of (response_message, conversation_id, function_calls)
        """
        # Check if OpenAI client is initialized
        if not self.client:
            return (
                "⚠️ Alfred is not configured yet. Please add your OpenAI API key in the Settings → Integrations page to enable AI chat.",
                conversation_id or "temp",
                []
            )
        
        # Get or create conversation
        if conversation_id:
            session = db.query(AlfredSession).filter(
                AlfredSession.id == conversation_id,
                AlfredSession.user_id == user_id
            ).first()
            if session:
                messages = session.conversation or []
            else:
                conversation_id = None
                messages = []
        else:
            messages = []
        
        if not conversation_id:
            # Create new conversation
            session = AlfredSession(
                user_id=user_id,
                conversation=[],
                channel="dashboard"
            )
            db.add(session)
            db.commit()
            db.refresh(session)
            conversation_id = str(session.id)
        
        # Add user message to history
        messages.append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        # Build context
        integrations = self._get_user_integrations(user_id, db)
        metrics = await self._get_user_metrics(user_id, db)
        
        # 2. Get RAG Context (Knowledge Base)
        # from services.rag_service import rag_service
        # rag_docs = rag_service.search(db, message, limit=3)
        rag_docs = []
        
        context = {
            "integrations": integrations,
            "metrics": metrics,
            "notifications": dashboard_context.get("notifications", []) if dashboard_context else [],
            "rag_docs": rag_docs
        }
        
        # Prepare messages for OpenAI
        openai_messages = [
            {'role': 'system', 'content': self.get_system_prompt(user_name, user_role, context)}
        ]
        
        # Add conversation history (last 20 messages for better context)
        # Only include user and assistant messages - skip tool messages
        for msg in messages[-20:]:
            if msg['role'] in ['user', 'assistant']:
                openai_messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })
        
        # Call OpenAI with function calling
        function_calls_made = []
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=openai_messages,
                tools=[{"type": "function", "function": func} for func in self.get_functions_schema()],
                tool_choice="auto",
                temperature=0.7,
                max_tokens=500
            )
            
            assistant_message = response.choices[0].message
            
            # Check if function was called (new API uses tool_calls)
            if assistant_message.tool_calls:
                tool_call = assistant_message.tool_calls[0]
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                # Execute function
                function_result = await self.execute_function(
                    function_name,
                    function_args,
                    user_id,
                    db
                )
                
                function_calls_made.append({
                    'name': function_name,
                    'arguments': function_args,
                    'result': function_result
                })
                
                # NOTE: We don't add tool messages to the persistent conversation history
                # because OpenAI requires specific formatting (tool_calls + tool responses)
                # that would break when reloading the conversation later.
                # Instead, we only store user and assistant messages.
                
                # Get final response with function result
                openai_messages.append({
                    'role': 'assistant',
                    'content': None,
                    'tool_calls': [tool_call.model_dump()]
                })
                openai_messages.append({
                    'role': 'tool',
                    'tool_call_id': tool_call.id,
                    'name': function_name,
                    'content': json.dumps(function_result)
                })
                
                final_response = self.client.chat.completions.create(
                    model=self.model,
                    messages=openai_messages,
                    temperature=0.7,
                    max_tokens=300
                )
                
                response_text = final_response.choices[0].message.content
            else:
                response_text = assistant_message.content
            
            # Add assistant response to history
            messages.append({
                'role': 'assistant',
                'content': response_text,
                'timestamp': datetime.utcnow().isoformat()
            })
            
            # Update conversation in database
            session.conversation = messages
            db.commit()
            
            return response_text, conversation_id, function_calls_made
            
        except Exception as e:
            import traceback
            print(f"❌ OpenAI API Error Type: {type(e).__name__}")
            print(f"❌ OpenAI API Error: {str(e)}")
            print(f"❌ Traceback:\n{traceback.format_exc()}")
            
            # Check if it's an OpenAI-specific error
            error_msg = str(e)
            if "401" in error_msg or "unauthorized" in error_msg.lower():
                fallback = f"⚠️ OpenAI Authentication Failed: {error_msg}. Your API key might be invalid, expired, or need billing enabled. Please check your OpenAI dashboard."
            elif "rate_limit" in error_msg.lower():
                fallback = "⚠️ OpenAI rate limit reached. Please try again in a moment."
            else:
                fallback = f"I apologize, but I encountered an error: {error_msg}"
            
            messages.append({
                'role': 'assistant',
                'content': fallback,
                'timestamp': datetime.utcnow().isoformat()
            })
            
            session.conversation = messages
            db.commit()
            
            return fallback, conversation_id, []
    
    async def execute_function(
        self,
        function_name: str,
        arguments: Dict[str, Any],
        user_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """Execute a function call"""
        
        if function_name == "create_task":
            return await self._create_task(arguments, user_id, db)
        elif function_name == "schedule_meeting":
            return await self._schedule_meeting(arguments, user_id, db)
        elif function_name == "send_whatsapp_message":
            return await self._send_whatsapp(arguments, user_id)
        elif function_name == "send_telegram_message":
            return await self._send_telegram(arguments, user_id)
        elif function_name == "get_analytics":
            return await self._get_analytics(arguments, user_id, db)
        elif function_name == "add_customer":
            return await self._add_customer(arguments, user_id, db)
        elif function_name == "add_expense":
            return await self._add_expense(arguments, user_id, db)
        elif function_name == "add_project":
            return await self._add_project(arguments, user_id, db)
        elif function_name == "get_metrics":
            return await self._get_metrics(arguments, user_id, db)
        else:
            return {"error": f"Unknown function: {function_name}"}
    
    async def _create_task(self, args: Dict[str, Any], user_id: int, db: Session) -> Dict[str, Any]:
        """Create a task - integrated with tasks system"""
        try:
            from models.task import Task, TaskPriority, TaskStatus
            
            # Parse priority
            priority_str = args.get('priority', 'medium').lower()
            priority_map = {
                'low': TaskPriority.LOW,
                'medium': TaskPriority.MEDIUM,
                'high': TaskPriority.HIGH,
                'urgent': TaskPriority.URGENT
            }
            priority = priority_map.get(priority_str, TaskPriority.MEDIUM)
            
            # Parse due date
            due_date_str = args.get('due_date', '')
            due_date = None
            if due_date_str:
                if 'today' in due_date_str.lower():
                    due_date = datetime.now()
                elif 'tomorrow' in due_date_str.lower():
                    due_date = datetime.now() + timedelta(days=1)
                elif 'week' in due_date_str.lower():
                    due_date = datetime.now() + timedelta(days=7)
                else:
                    try:
                        due_date = datetime.strptime(due_date_str, '%Y-%m-%d')
                    except:
                        pass
            
            # Create task
            task = Task(
                title=args.get('title', 'New Task'),
                description=args.get('description', ''),
                priority=priority,
                status=TaskStatus.TODO,
                creator_id=user_id,
                assigned_to_id=args.get('assigned_to_id', user_id),
                due_date=due_date
            )
            
            db.add(task)
            db.commit()
            db.refresh(task)
            
            return {
                "success": True,
                "message": f"Task '{task.title}' created successfully with {priority_str} priority",
                "task_id": task.id,
                "details": {
                    "title": task.title,
                    "priority": priority_str,
                    "due_date": due_date.isoformat() if due_date else None
                }
            }
            
        except Exception as e:
            print(f"Error creating task: {e}")
            return {
                "success": False,
                "error": f"Failed to create task: {str(e)}"
            }
    
    async def _schedule_meeting(self, args: Dict[str, Any], user_id: int, db: Session) -> Dict[str, Any]:
        """Schedule a meeting - integrated with Google Calendar"""
        try:
            from models.meeting import Meeting
            from services.google_calendar_service import google_calendar_service
            
            # Parse date and time
            date_str = args.get('date', '')
            time_str = args.get('time', '')
            duration = args.get('duration', 60)  # default 60 minutes
            
            # Convert natural language date/time to datetime
            # For now, handle "tomorrow" and specific dates
            if 'tomorrow' in date_str.lower():
                start_date = datetime.now() + timedelta(days=1)
            else:
                # Try to parse date (YYYY-MM-DD format)
                try:
                    start_date = datetime.strptime(date_str, '%Y-%m-%d')
                except:
                    start_date = datetime.now() + timedelta(days=1)
            
            # Parse time (e.g., "2pm", "14:00")
            time_str = time_str.lower().replace(' ', '')
            if 'pm' in time_str:
                hour = int(time_str.replace('pm', '').replace(':', ''))
                if hour != 12:
                    hour += 12
            elif 'am' in time_str:
                hour = int(time_str.replace('am', '').replace(':', ''))
            else:
                try:
                    hour = int(time_str.split(':')[0])
                except:
                    hour = 14  # default 2pm
            
            # Create start and end times
            start_time = start_date.replace(hour=hour, minute=0, second=0, microsecond=0)
            end_time = start_time + timedelta(minutes=duration)
            
            # Get user timezone
            user_timezone = 'UTC'  # TODO: Get from user preferences
            
            # Check for conflicts
            conflicts = db.query(Meeting).filter(
                Meeting.organizer_id == user_id,
                Meeting.start_time < end_time,
                Meeting.end_time > start_time,
                Meeting.status != 'cancelled'
            ).all()
            
            if conflicts:
                conflict_titles = [c.title for c in conflicts]
                return {
                    "success": False,
                    "conflict": True,
                    "message": f"⚠️ You have a scheduling conflict! You already have '{conflict_titles[0]}' at that time. Would you like me to find an alternative time slot?",
                    "conflicts": [{"title": c.title, "start": c.start_time.isoformat()} for c in conflicts]
                }
            
            # Create meeting in database
            meeting = Meeting(
                title=args.get('title', 'Meeting'),
                description=args.get('description', ''),
                start_time=start_time,
                end_time=end_time,
                timezone=user_timezone,
                organizer_id=user_id,
                participants=args.get('participants', []),
                status='scheduled'
            )
            
            db.add(meeting)
            db.commit()
            db.refresh(meeting)
            
            # Try to create in Google Calendar if connected
            try:
                # Check if user has Google Calendar connected
                from models.api_key import ApiKey
                from services.encryption_service import encryption_service
                
                calendar_key = db.query(ApiKey).filter(
                    ApiKey.user_id == user_id,
                    ApiKey.service == 'google_calendar'
                ).first()
                
                if calendar_key:
                    # Decrypt access token
                    access_token = encryption_service.decrypt(
                        calendar_key.encrypted_key,
                        calendar_key.iv,
                        calendar_key.tag
                    )
                    
                    # Create in Google Calendar
                    google_event = google_calendar_service.create_event(
                        access_token=access_token,
                        title=meeting.title,
                        description=meeting.description,
                        start_time=start_time,  # datetime object, not string
                        end_time=end_time,  # datetime object, not string
                        attendees=meeting.participants,
                        timezone=user_timezone
                    )
                    
                    # Update meeting with Google Calendar details
                    meeting.google_event_id = google_event.get('event_id')
                    meeting.meet_link = google_event.get('meet_link')
                    db.commit()
                    
            except Exception as e:
                print(f"Could not create Google Calendar event: {e}")
                import traceback
                traceback.print_exc()
                # Continue anyway - meeting is saved in our database
            
            return {
                "success": True,
                "message": f"Meeting '{meeting.title}' scheduled for {start_time.strftime('%B %d at %I:%M %p')}",
                "meeting_id": meeting.id,
                "details": {
                    "title": meeting.title,
                    "start_time": start_time.isoformat(),
                    "end_time": end_time.isoformat(),
                    "meet_link": meeting.meet_link
                }
            }
            
        except Exception as e:
            print(f"❌ Error scheduling meeting: {e}")
            import traceback
            traceback.print_exc()
            
            # More helpful error message
            error_msg = str(e)
            if "No module named" in error_msg or "cannot import" in error_msg.lower():
                error_msg = f"Missing Python module: {error_msg}. Please check backend dependencies."
            elif "Meeting" in error_msg:
                error_msg = "Database issue with meetings table. Please check backend logs."
            
            return {
                "success": False,
                "error": f"Failed to schedule meeting: {error_msg}"
            }
    
    async def _send_whatsapp(self, args: Dict[str, Any], user_id: int) -> Dict[str, Any]:
        """Send WhatsApp message (placeholder - integrate with WhatsApp API)"""
        return {
            "success": True,
            "message": f"WhatsApp message sent to {args['recipient']}",
            "details": args
        }
    
    async def _send_telegram(self, args: Dict[str, Any], user_id: int) -> Dict[str, Any]:
        """Send Telegram message (placeholder - integrate with Telegram API)"""
        return {
            "success": True,
            "message": f"Telegram message sent to {args['recipient']}",
            "details": args
        }
    
    async def _get_analytics(self, args: Dict[str, Any], user_id: int, db: Session) -> Dict[str, Any]:
        """Get analytics (placeholder - integrate with actual analytics)"""
        metric = args['metric']
        time_period = args.get('time_period', 'today')
        
        # Mock analytics data
        analytics_data = {
            "tasks": {
                "total": 12,
                "completed": 8,
                "in_progress": 3,
                "overdue": 1
            },
            "meetings": {
                "scheduled": 5,
                "completed": 3,
                "upcoming": 2
            },
            "team_activity": {
                "active_members": 5,
                "messages_sent": 47,
                "tasks_completed": 8
            },
            "feature_requests": {
                "total": 8,
                "pending": 3,
                "in_progress": 2,
                "completed": 3
            }
        }
        
        if metric == "overall":
            return {
                "success": True,
                "time_period": time_period,
                "data": analytics_data
            }
        else:
            return {
                "success": True,
                "metric": metric,
                "time_period": time_period,
                "data": analytics_data.get(metric, {})
            }

    def _get_user_integrations(self, user_id: int, db: Session) -> Dict[str, bool]:
        """Get user connected integrations"""
        keys = db.query(ApiKey).filter(ApiKey.user_id == user_id).all()
        connected = {k.service: True for k in keys}
        return {
            "telegram": connected.get("telegram", False),
            "whatsapp": connected.get("whatsapp", False),
            "google_calendar": connected.get("google_calendar", False)
        }

    async def _get_user_metrics(self, user_id: int, db: Session) -> Dict[str, Any]:
        """Get metrics user has access to"""
        return await metrics_service.get_user_metrics(db, user_id)
    
    async def _add_customer(self, args: Dict[str, Any], user_id: int, db: Session) -> Dict[str, Any]:
        """Add a new customer to Google Sheets"""
        try:
            from services.sheets_service import sheets_service
            from datetime import datetime
            
            # Prepare customer data
            customer_data = {
                'customer_name': args.get('customer_name'),
                'setup_fee': args.get('setup_fee', 0),
                'mrr': args.get('mrr', 0),
                'start_date': args.get('start_date', datetime.now().strftime('%Y-%m-%d')),
                'industry': args.get('industry', ''),
                'status': 'Active',
                'plan_duration': args.get('plan_duration', 12),
                'notes': f'Added by Alfred on behalf of user {user_id}'
            }
            
            # Add to Google Sheets
            success = sheets_service.add_customer(customer_data)
            
            if success:
                return {
                    "success": True,
                    "message": f"✅ Customer '{customer_data['customer_name']}' added successfully!\n\n" +
                               f"💰 Setup Fee: ${customer_data['setup_fee']:,.2f}\n" +
                               f"📊 MRR: ${customer_data['mrr']:,.2f}/month\n" +
                               f"📅 Start Date: {customer_data['start_date']}\n" +
                               f"🏢 Industry: {customer_data['industry']}\n\n" +
                               f"The metrics will update automatically within 5 minutes.",
                    "customer_data": customer_data
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to add customer to Google Sheets. Please check the integration."
                }
                
        except Exception as e:
            print(f"Error adding customer: {e}")
            return {
                "success": False,
                "error": f"Failed to add customer: {str(e)}"
            }
    
    async def _add_expense(self, args: Dict[str, Any], user_id: int, db: Session) -> Dict[str, Any]:
        """Add a business expense to Google Sheets"""
        try:
            from services.sheets_service import sheets_service
            from datetime import datetime
            from models.user import User
            
            # Get user name
            user = db.query(User).filter(User.id == user_id).first()
            user_name = user.name if user else "Unknown"
            
            # Prepare expense data
            expense_data = {
                'date': args.get('date', datetime.now().strftime('%Y-%m-%d')),
                'category': args.get('category'),
                'amount': args.get('amount', 0),
                'description': args.get('description', ''),
                'added_by': user_name
            }
            
            # Add to Google Sheets
            success = sheets_service.add_expense(expense_data)
            
            if success:
                return {
                    "success": True,
                    "message": f"✅ Expense added successfully!\n\n" +
                               f"📂 Category: {expense_data['category']}\n" +
                               f"💵 Amount: ${expense_data['amount']:,.2f}\n" +
                               f"📝 Description: {expense_data['description']}\n" +
                               f"📅 Date: {expense_data['date']}\n\n" +
                               f"This will be included in CAC calculations automatically.",
                    "expense_data": expense_data
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to add expense to Google Sheets. Please check the integration."
                }
                
        except Exception as e:
            print(f"Error adding expense: {e}")
            return {
                "success": False,
                "error": f"Failed to add expense: {str(e)}"
            }
    
    async def _add_project(self, args: Dict[str, Any], user_id: int, db: Session) -> Dict[str, Any]:
        """Add a completed project to Google Sheets for QVC tracking"""
        try:
            from services.sheets_service import sheets_service
            from datetime import datetime
            
            # Prepare project data
            project_data = {
                'client_name': args.get('client_name'),
                'project_name': args.get('project_name'),
                'completion_date': args.get('completion_date', datetime.now().strftime('%Y-%m-%d')),
                'documentation_link': args.get('documentation_link', ''),
                'value_type': args.get('value_type'),
                'value_amount': args.get('value_amount', 0),
                'calculated_by': 'Manual',
                'notes': f'Added by Alfred on behalf of user {user_id}'
            }
            
            # Add to Google Sheets
            success = sheets_service.add_project(project_data)
            
            if success:
                return {
                    "success": True,
                    "message": f"✅ Project '{project_data['project_name']}' added successfully!\n\n" +
                               f"👤 Client: {project_data['client_name']}\n" +
                               f"💎 Value Type: {project_data['value_type']}\n" +
                               f"💰 Value: ${project_data['value_amount']:,.2f}\n" +
                               f"📅 Completed: {project_data['completion_date']}\n\n" +
                               f"This will be included in QVC calculations automatically.",
                    "project_data": project_data
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to add project to Google Sheets. Please check the integration."
                }
                
        except Exception as e:
            print(f"Error adding project: {e}")
            return {
                "success": False,
                "error": f"Failed to add project: {str(e)}"
            }
    
    async def _get_metrics(self, args: Dict[str, Any], user_id: int, db: Session) -> Dict[str, Any]:
        """Get current business metrics"""
        try:
            from models.business_metric import BusinessMetric, MetricPermission
            from models.user import User
            
            metric_type = args.get('metric_type', 'all')
            user = db.query(User).filter(User.id == user_id).first()
            
            from services.permission_service import PermissionService
            permission_service = PermissionService(db)

            # Check permissions
            def has_permission(m_type):
                if user.role == 'ceo':
                    return True
                # Map metric type to feature key
                feature_key = f"metrics.{m_type}.view"
                return permission_service.check_permission(user, feature_key)
            
            if metric_type == 'all':
                # Get all metrics user has access to
                metrics = {}
                for m_type in ['mrr', 'cac', 'ltv', 'qvc', 'ltgp']:
                    if has_permission(m_type):
                        metric = db.query(BusinessMetric).filter(
                            BusinessMetric.metric_type == m_type
                        ).first()
                        if metric:
                            metrics[m_type] = {
                                'current': float(metric.current_value) if metric.current_value else 0,
                                'change': float(metric.change_percentage) if metric.change_percentage else 0
                            }
                
                # Format response
                response = "📊 **Business Metrics Summary**\n\n"
                
                if 'mrr' in metrics:
                    mrr = metrics['mrr']
                    response += f"💰 **MRR**: ${mrr['current']:,.2f} ({mrr['change']:+.1f}%)\n"
                
                if 'cac' in metrics:
                    cac = metrics['cac']
                    response += f"💵 **CAC**: ${cac['current']:,.2f} ({cac['change']:+.1f}%)\n"
                
                if 'ltv' in metrics:
                    ltv = metrics['ltv']
                    response += f"💎 **LTV**: ${ltv['current']:,.2f} ({ltv['change']:+.1f}%)\n"
                
                if 'qvc' in metrics:
                    qvc = metrics['qvc']
                    response += f"🎯 **QVC**: ${qvc['current']:,.2f} ({qvc['change']:+.1f}%)\n"
                
                if 'ltgp' in metrics:
                    ltgp = metrics['ltgp']
                    response += f"🚀 **LTGP**: ${ltgp['current']:,.2f}\n"
                
                return {
                    "success": True,
                    "message": response,
                    "metrics": metrics
                }
            else:
                # Get specific metric
                if not has_permission(metric_type):
                    return {
                        "success": False,
                        "error": f"You don't have permission to view {metric_type.upper()} metrics."
                    }
                
                metric = db.query(BusinessMetric).filter(
                    BusinessMetric.metric_type == metric_type
                ).first()
                
                if not metric:
                    return {
                        "success": False,
                        "error": f"Metric {metric_type.upper()} not found. Metrics may not be synced yet."
                    }
                
                # Format detailed response
                current = float(metric.current_value) if metric.current_value else 0
                change = float(metric.change_percentage) if metric.change_percentage else 0
                metadata = metric.meta_data or {}
                
                response = f"📊 **{metric_type.upper()} Details**\n\n"
                response += f"Current Value: ${current:,.2f}\n"
                response += f"Change: {change:+.1f}%\n\n"
                
                # Add metadata details
                if metric_type == 'mrr' and metadata:
                    response += f"Active Customers: {metadata.get('active_customers', 0)}\n"
                    response += f"New MRR: ${metadata.get('new_mrr', 0):,.2f}\n"
                    response += f"Churned MRR: ${metadata.get('churned_mrr', 0):,.2f}\n"
                elif metric_type == 'cac' and metadata:
                    response += f"Marketing Spend: ${metadata.get('marketing_spend', 0):,.2f}\n"
                    response += f"Sales Cost: ${metadata.get('sales_cost', 0):,.2f}\n"
                    response += f"New Customers: {metadata.get('new_customers', 0)}\n"
                elif metric_type == 'ltv' and metadata:
                    response += f"Avg MRR per Customer: ${metadata.get('avg_mrr', 0):,.2f}\n"
                    response += f"Avg Duration: {metadata.get('avg_duration', 0):.1f} months\n"
                    response += f"Churn Rate: {metadata.get('churn_rate', 0):.1f}%\n"
                
                return {
                    "success": True,
                    "message": response,
                    "metric": {
                        'type': metric_type,
                        'current': current,
                        'change': change,
                        'metadata': metadata
                    }
                }
                
        except Exception as e:
            print(f"Error getting metrics: {e}")
            return {
                "success": False,
                "error": f"Failed to get metrics: {str(e)}"
            }

# Lazy-loaded global instance
_alfred_service_instance = None

def get_alfred_service() -> AlfredService:
    """Get or create the Alfred service instance"""
    global _alfred_service_instance
    if _alfred_service_instance is None:
        print(f"🔧 Initializing Alfred service with API key: {settings.OPENAI_API_KEY[:20] if settings.OPENAI_API_KEY else 'NONE'}...")
        _alfred_service_instance = AlfredService()
        print(f"✅ Alfred service initialized. Client: {_alfred_service_instance.client is not None}")
    return _alfred_service_instance
