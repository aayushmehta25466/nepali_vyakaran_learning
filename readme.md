# Nepali Vyakaran Learning Platform

A containerized full-stack educational platform for learning Nepali grammar through gamified lessons, quizzes, and interactive village-building mechanics.

## Purpose

This project serves as a prototype deployment for educational technology, demonstrating modern containerization practices, service architecture, and API design patterns. Built as part of **Week 6: Service Deployment & Operations** bootcamp curriculum to showcase understanding of deployment concepts, microservice communication, and containerized application orchestration.

## System Architecture

The platform follows a containerized microservices architecture with clear separation of concerns:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Django Backend │    │   PostgreSQL DB │
│   (Port 3000)   │◄──►│   (Port 8000)    │◄──►│   (Port 5432)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        
         │                        ▼                        
         │              ┌─────────────────┐                
         │              │   Redis Cache   │                
         └──────────────►│   (Port 6379)   │                
                        └─────────────────┘                
```

**Request Flow:**
1. React frontend sends HTTP requests to Django REST API
2. Django processes requests, validates JWT tokens, and queries PostgreSQL
3. Redis provides session caching and real-time data storage
4. All services communicate through Docker's internal networking

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 18 + React Router | Single-page application with routing |
| **UI Framework** | Tailwind CSS + Framer Motion | Responsive design and animations |
| **Backend** | Django 5.2 + Django REST Framework | REST API server and business logic |
| **Authentication** | JWT + Django AllAuth | Secure token-based authentication |
| **Database** | PostgreSQL 16 | Primary data persistence |
| **Cache** | Redis 7 | Session management and performance optimization |
| **Containerization** | Docker + Docker Compose | Service orchestration and deployment |
| **Web Server** | Gunicorn | WSGI application server for production |

## Service Overview

### 🎯 Frontend Service (`nepali_frontend`)
- **Purpose**: Serves the React application with interactive UI components
- **Port**: 3000
- **Dependencies**: Backend API for data operations
- **Features**: Responsive design, gamified learning interface, real-time updates

### 🔧 Backend Service (`nepali_backend`)  
- **Purpose**: REST API server handling business logic and data operations
- **Port**: 8000
- **Dependencies**: PostgreSQL database, Redis cache
- **Features**: JWT authentication, RESTful endpoints, admin interface

### 🗄️ Database Service (`nepali_db`)
- **Purpose**: Primary data storage for user accounts, lessons, progress tracking
- **Port**: 5432  
- **Technology**: PostgreSQL 16 with UTF-8 encoding
- **Features**: ACID compliance, relational data integrity

### ⚡ Cache Service (`nepali_redis`)
- **Purpose**: Session storage, temporary data caching, performance optimization
- **Port**: 6379
- **Technology**: Redis 7 with data persistence
- **Features**: In-memory operations, pub/sub capabilities

## API Specification

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| `/api/v1/auth/login/` | POST | User authentication with JWT token | None |
| `/api/v1/lessons/` | GET | Retrieve available grammar lessons | JWT |
| `/api/v1/lessons/{id}/` | GET | Get specific lesson content and exercises | JWT |
| `/api/v1/quizzes/{id}/submit/` | POST | Submit quiz answers and get results | JWT |
| `/api/v1/me/game-state/` | GET | Retrieve user's progress and village state | JWT |
| `/api/v1/village/buildings/add/` | POST | Add building to user's virtual village | JWT |
| `/api/health/` | GET | Health check endpoint for monitoring | None |

## Quick Start with Docker Compose

### Prerequisites
- Docker Engine 20.0+
- Docker Compose 2.0+
- 4GB available RAM

### 1. Clone and Setup
```bash
git clone <repository-url>
cd nepali-vyakaran-learning
```

### 2. Environment Configuration
Create `.env` file in project root:
```bash
# Database Configuration
POSTGRES_DB=nepali_vyakaran
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password

# Backend Configuration  
SECRET_KEY=your_django_secret_key_here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
```

### 3. Launch Services
```bash
# Build and start all services
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/v1/
- **Admin Panel**: http://localhost:8000/admin/

### 5. Health Verification
```bash
# Check service health
curl http://localhost:8000/api/health/

# View service logs
docker-compose logs backend
```

## Deployment Concepts Demonstrated

### 🐳 Containerization Benefits
- **Portability**: Runs consistently across development, staging, and production environments
- **Isolation**: Each service runs in isolated containers with defined resource boundaries  
- **Scalability**: Individual services can be scaled independently using Docker Swarm or Kubernetes
- **Dependency Management**: All dependencies are containerized, eliminating "works on my machine" issues

### 🔗 Service Communication
- **Internal Networking**: Services communicate via Docker's internal DNS resolution
- **Health Checks**: Automated health monitoring ensures service reliability
- **Graceful Degradation**: Services handle dependency failures appropriately

### 🚀 Cloud-Ready Architecture
- **12-Factor App Compliance**: Environment-based configuration, stateless processes
- **Horizontal Scaling**: Stateless design allows multiple backend instances
- **Data Persistence**: Volumes ensure data survives container restarts
- **Load Balancer Ready**: Backend designed for reverse proxy integration

## Development vs Production

This prototype includes production-ready patterns:

**Production Adaptations:**
- Replace SQLite with PostgreSQL (already implemented)
- Use Gunicorn WSGI server (configured)
- Static file serving via volumes
- Environment-based configuration
- Health check endpoints for monitoring

**Cloud Migration Path:**
- Container images can deploy to any Docker-compatible platform
- Database can migrate to managed PostgreSQL services
- Redis can use managed cache services  
- Frontend can deploy to CDN with API proxy configuration

## Project Status

**Current State**: ✅ Fully functional prototype  
**Deployment Ready**: ✅ Containerized with Docker Compose  
**Production Considerations**: ⚠️ Requires security hardening and monitoring for production use

This project demonstrates core deployment concepts including containerization, service orchestration, API design, and cloud-ready architecture patterns suitable for educational technology platforms.


