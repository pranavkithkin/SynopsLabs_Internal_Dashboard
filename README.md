# Synops Labs Dashboard

Enterprise AI Agent Consultancy Dashboard with Business Metrics & KPI Tracking

![Dashboard Preview](./app/opengraph-image.png)

## 🚀 Overview

The Synops Labs Dashboard is a modern, enterprise-grade web application built for AI agent consultancy operations. It provides real-time business metrics tracking, KPI monitoring, and an intelligent AI assistant (Alfred) to help manage your business operations.

### Key Features

- **📊 Business Metrics Tracking**: Real-time monitoring of MRR, CAC, LTV, QVC, and LTGP
- **📈 KPI Tracking System**: Daily, weekly, and monthly KPI monitoring with goal setting
- **🤖 Alfred AI Assistant**: Permission-aware AI chatbot (Cmd+K / Ctrl+K)
- **🔐 Role-Based Access Control**: Granular permissions for CEO, Co-Founders, and team members
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **⚡ Performance Optimized**: Code splitting, lazy loading, and caching for fast load times
- **♿ Accessible**: WCAG AA compliant with keyboard navigation and screen reader support

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + Custom Components
- **State Management**: Zustand + React Query
- **Animations**: Framer Motion
- **Charts**: Recharts
- **AI**: OpenAI GPT-4 (for Alfred)
- **Data Source**: Google Sheets API

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API server (FastAPI)
- Google Cloud account (for Sheets API)
- OpenAI API key (for Alfred AI)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd 0004_Dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your values:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google Sheets Integration
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=your-private-key-here
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# OpenAI API (for Alfred)
OPENAI_API_KEY=sk-your-openai-api-key

# Authentication Secrets
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | ✅ Yes |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Service account email | ✅ Yes |
| `GOOGLE_SHEETS_PRIVATE_KEY` | Service account private key | ✅ Yes |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Google Sheets ID for data | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI API key for Alfred | ✅ Yes |
| `JWT_SECRET` | JWT signing secret | ✅ Yes |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | ✅ Yes |
| `DISCORD_CLIENT_ID` | Discord OAuth client ID | ❌ Optional |
| `DISCORD_CLIENT_SECRET` | Discord OAuth secret | ❌ Optional |
| `GOOGLE_CALENDAR_CLIENT_ID` | Google Calendar client ID | ❌ Optional |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Google Calendar secret | ❌ Optional |

## 🏗️ Project Structure

```
0004_Dashboard/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main dashboard page
│   ├── layout.tsx         # Root layout with providers
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # React components
│   ├── alfred/           # Alfred AI components
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── metrics/     # Business metric cards
│   │   └── kpis/        # KPI tracking components
│   ├── ui/              # Reusable UI components
│   └── error-boundary.tsx
├── lib/                  # Utility libraries
│   ├── auth/            # Authentication logic
│   ├── permissions/     # Permission system
│   ├── services/        # API client services
│   └── hooks/           # Custom React hooks
├── public/              # Static assets
└── styles/              # Global styles
```

## 🚀 Development Workflow

### Running locally

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Configured for Next.js and React
- **Prettier**: Code formatting (configure as needed)

## 🎨 Features Guide

### Business Metrics

The dashboard tracks 5 key business metrics:

1. **MRR (Monthly Recurring Revenue)**: Track recurring revenue and growth
2. **CAC (Customer Acquisition Cost)**: Calculate cost per customer
3. **LTV (Lifetime Value)**: Estimate customer lifetime value
4. **QVC (Quarterly Value Created)**: Track project value delivery
5. **LTGP (Long-Term Growth Potential)**: Assess market opportunity

### KPI Tracking

Monitor performance across 4 categories:

- **Sales KPIs**: Revenue, deals closed, conversion rates
- **Marketing KPIs**: Leads, campaigns, engagement
- **Operations KPIs**: Efficiency, delivery, quality
- **Finance KPIs**: Expenses, profitability, cash flow

### Alfred AI Assistant

Press **Cmd+K** (Mac) or **Ctrl+K** (Windows/Linux) to open Alfred:

- Ask questions about metrics and KPIs
- Create tasks and schedule meetings
- Get insights and recommendations
- Permission-aware responses based on your role

### Role-Based Permissions

- **CEO**: Full access to all features and data
- **Co-Founder**: Full access (cannot delete CEO account)
- **Sales Agent**: Limited access (MRR, CAC, Sales KPIs only)
- **Custom Roles**: Granular permission control

## 📖 User Guides

Detailed user guides for each role:

- [CEO Guide](./docs/USER_GUIDE_CEO.md) - Full feature access
- [Co-Founder Guide](./docs/USER_GUIDE_COFOUNDER.md) - Full feature access
- [Sales Agent Guide](./docs/USER_GUIDE_SALES_AGENT.md) - Limited access

## 🔌 API Integration

The dashboard integrates with a FastAPI backend. See [API Documentation](./docs/API_DOCUMENTATION.md) for details on:

- Authentication endpoints
- Metrics endpoints
- KPI endpoints
- Alfred chat endpoint

## 🚢 Deployment

See the [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for step-by-step instructions on deploying to Vercel.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Click the button above
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy!

## 🧪 Testing

### Browser Testing

```bash
npm run dev
# Open http://localhost:3000 in different browsers
```

### Performance Testing

```bash
npm run build
npm run start
# Run Lighthouse audit in Chrome DevTools
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Proprietary - Synops Labs

## 🆘 Support

For support, contact the Synops Labs team or refer to the documentation in the `docs/` directory.

---

Built with ❤️ by the Synops Labs team
