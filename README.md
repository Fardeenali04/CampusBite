
# CampusBite 🍔

CampusBite is a full-stack food ordering platform built with React, FastAPI, and PostgreSQL. It supports customers, restaurant owners, and delivery partners through role-based dashboards.

## Features

### Customer
- Register and log in
- Browse and search restaurants
- View menus and manage cart
- Place orders with simulated payment
- Track order status and view order history
- Cancel orders while they are PLACED
- Submit reviews after delivery
- Request refunds after delivery
- View insights based on order history

### Restaurant Owner
- Manage restaurant details and menu items
- View and manage incoming orders
- Accept, prepare, and mark orders as ready
- Assign delivery partners
- View order reminders
- Approve or reject refund requests

### Delivery Partner
- View assigned deliveries
- Update delivery status
- View delivery history

## Technology Stack

**Frontend**
- React
- Vite
- React Router
- CSS

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication

**Database and Deployment**
- PostgreSQL
- Docker
- Docker Compose

## Project Structure

```text
CampusBite/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js and npm
- Docker Desktop

### 1. Configure Environment

Create a `.env` file in the project root using `.env.example` as a template.

Fill in your PostgreSQL credentials and application settings. Never commit your `.env` file or API keys.

### 2. Start with Docker

From the project root, run:

```bash
docker compose up -d --build
```

Check running containers:

```bash
docker compose ps
```

Stop the containers:

```bash
docker compose down
```

### 3. Access the Application

- Backend API: http://localhost:8000
- Swagger Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health
- Frontend: http://localhost:5173

Run the frontend separately:

```bash
cd frontend
npm install
npm run dev
```

## API Overview

| Module | Main Endpoints |
|---|---|
| Authentication | `/auth/register`, `/auth/login`, `/auth/me` |
| Restaurants | `/restaurants/` |
| Menu | `/menu/` |
| Orders | `/orders/` |
| Reviews | `/reviews/` |
| Refunds | `/refunds/` |
| Reminders | `/reminders/owner` |
| AI Insights | `/ai/insights` |

Most endpoints require JWT authentication and role-based authorization.

## Order Workflow

```text
PLACED
  ↓
ACCEPTED
  ↓
PREPARING
  ↓
READY
  ↓
ASSIGNED
  ↓
OUT_FOR_DELIVERY
  ↓
DELIVERED
```

Additional outcomes include CANCELLED and REFUNDED.

## AI Order Insights

The customer insights feature analyzes the authenticated customer's order history and provides spending, order-status, and popular-item insights.

OpenAI API usage requires a valid API key and available API billing credits. Local history-based insights are available as a fallback.

## Security

- JWT-based authentication
- Role-based access control
- Password hashing
- Environment-based configuration
- Secrets excluded through `.gitignore`

## Notes

- Payments are simulated using a dummy payment flow.
- Refund processing is simulated.
- Configure environment variables before starting the backend.
