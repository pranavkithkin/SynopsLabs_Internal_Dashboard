# Synops Labs Dashboard - Backend

## Quick Start

### 1. Install Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

### 3. Run the Server
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: http://localhost:8000

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Current Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Metrics
- `GET /api/metrics/mrr` - Monthly Recurring Revenue
- `GET /api/metrics/cac` - Customer Acquisition Cost
- `GET /api/metrics/ltv` - Lifetime Value
- `GET /api/metrics/qvc` - Quarterly Value Created
- `GET /api/metrics/ltgp` - Long-term Growth Potential

### Alfred AI
- `POST /api/alfred/chat` - Chat with Alfred

### KPIs
- `GET /api/kpis/daily` - Daily KPIs
- `GET /api/kpis/weekly` - Weekly KPIs
- `GET /api/kpis/monthly` - Monthly KPIs

### Permissions
- `GET /api/permissions/me` - Get current user's permissions

## Project Structure

```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Environment template
└── README.md           # This file
```

## Development

### Adding New Endpoints

1. Add endpoint to `main.py`
2. Test with Swagger UI
3. Update this README

### Mock Data

Currently using mock data in `MOCK_USERS` dictionary. Replace with database queries when ready.

## Production Deployment

See `DEPLOYMENT_GUIDE.md` in the root directory.
