# Alfred AI Assistant - Quick Reference

## 🚀 Quick Start

### Opening Alfred
Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) from anywhere in the dashboard.

### Closing Alfred
- Press `ESC`
- Press `Cmd+K` / `Ctrl+K` again
- Click outside the modal

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd+K` / `Ctrl+K` | Open/Close Alfred |
| `ESC` | Close Alfred |
| `Enter` | Send message |
| `Shift+Enter` | New line |

---

## 📁 File Structure

```
lib/
├── services/
│   └── alfred-api.ts          # API client
└── hooks/
    ├── use-alfred.ts          # State management
    └── use-keyboard-shortcut.ts  # Keyboard shortcuts

components/
└── alfred/
    ├── alfred-command-palette.tsx  # Main component
    ├── alfred-message.tsx          # Message bubbles
    ├── alfred-input.tsx            # Input field
    ├── alfred-thinking.tsx         # Loading indicator
    └── alfred-function-call.tsx    # Function execution

types/
└── alfred.ts                  # TypeScript types
```

---

## 🔐 Permissions

**Required Permission:** `alfred.chat`

**Role Access:**
- ✅ CEO - Full access
- ✅ Co-Founder - Full access
- ✅ Sales Agent - Limited access

---

## 💡 Usage Examples

### Ask About Metrics
```
"What's our MRR this month?"
"Show me CAC trends"
"How's our LTV looking?"
```

### Create Tasks
```
"Create a task to review Q4 metrics"
"Add a high-priority task for the team meeting"
```

### Schedule Meetings
```
"Schedule a team sync tomorrow at 2pm"
"Book a 1-hour meeting for Friday"
```

---

## 🐛 Troubleshooting

### Alfred Won't Open
- Check if you have `alfred.chat` permission
- Try refreshing the page
- Check browser console for errors

### No Response from Alfred
- Verify backend API is running
- Check network tab for failed requests
- Ensure OpenAI API key is configured

### Messages Not Saving
- Check browser localStorage is enabled
- Clear localStorage and try again
- Check browser console for errors

---

## 🔧 Development

### Start Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Test Alfred
1. Log in to dashboard
2. Press `Cmd+K` / `Ctrl+K`
3. Send a test message

---

## 📝 Backend API

**Endpoint:** `POST /api/alfred/chat`

**Request:**
```json
{
  "message": "What's our MRR?",
  "conversation_id": "optional-uuid",
  "dashboard_context": {}
}
```

**Response:**
```json
{
  "message": "Our MRR is $45,230...",
  "conversation_id": "uuid",
  "actions_performed": [],
  "function_calls": []
}
```

---

## ✅ Checklist for Deployment

- [ ] Backend API is deployed
- [ ] OpenAI API key is configured
- [ ] Permissions are set up correctly
- [ ] Tested with all user roles
- [ ] Conversation history works
- [ ] Function calling works
- [ ] No console errors

---

## 📞 Support

For issues or questions:
1. Check the [walkthrough.md](file:///Users/pranav/.gemini/antigravity/brain/c1575764-5a18-4a78-9d46-9e06ad506d23/walkthrough.md)
2. Review backend logs
3. Check browser console
4. Test with different user roles
