# Architecture Documentation

## Deployment Architecture

The Nepali Vyakaran Learning Platform implements a containerized microservices architecture designed for scalability, maintainability, and deployment flexibility. Each component is containerized using Docker and orchestrated via Docker Compose.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Browser   │  │   Mobile    │  │     API     │   │
│  │     App     │  │     App     │  │   Client    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                  Load Balancer / CDN                    │
│                    (Port 80/443)                       │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│                                                         │
│  ┌─────────────────┐              ┌─────────────────┐  │
│  │  React Frontend │              │ Django Backend  │  │
│  │   (Port 3000)   │◄────────────►│   (Port 8000)   │  │
│  │                 │              │                 │  │
│  │ • Single Page   │              │ • REST API      │  │
│  │   Application   │              │ • JWT Auth      │  │
│  │ • React Router  │              │ • Business Logic│  │
│  │ • Tailwind CSS  │              │ • Admin Panel   │  │
│  └─────────────────┘              └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                          │
│                                                         │
│  ┌─────────────────┐              ┌─────────────────┐  │
│  │   PostgreSQL    │              │      Redis      │  │
│  │   (Port 5432)   │              │   (Port 6379)   │  │
│  │                 │              │                 │  │
│  │ • Primary DB    │              │ • Session Cache │  │
│  │ • User Data     │              │ • Temp Storage  │  │
│  │ • Lesson Content│              │ • Real-time Data│  │
│  │ • Game State    │              │ • Rate Limiting │  │
│  └─────────────────┘              └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Request Flow Architecture

### 1. User Authentication Flow
```
User → Frontend → Backend API → Redis (Session) → PostgreSQL (User Verification)
```

**Detailed Steps:**
1. User submits login credentials via React frontend
2. Frontend sends POST request to `/api/v1/auth/login/`
3. Django validates credentials against PostgreSQL user table
4. JWT token generated and cached in Redis for fast lookup
5. Token returned to frontend and stored in secure storage
6. Subsequent requests include JWT token in Authorization header

### 2. Lesson Access Flow
```
User → Frontend → Backend API → Redis (Cache Check) → PostgreSQL (Lesson Data)
```

**Detailed Steps:**
1. User navigates to lesson page in React application
2. Frontend requests lesson data from `/api/v1/lessons/{id}/`
3. Django checks Redis cache for lesson content
4. If cache miss, PostgreSQL queried for lesson data
5. Lesson content cached in Redis with TTL
6. JSON response sent to frontend for rendering

### 3. Game State Management Flow
```
User Action → Frontend → Backend API → Redis (Real-time) → PostgreSQL (Persistence)
```

**Detailed Steps:**
1. User performs game action (e.g., completes quiz, builds village)
2. Frontend sends state update to `/api/v1/me/game-state/`
3. Django processes game logic and validates action
4. Redis updated immediately for real-time responsiveness
5. PostgreSQL updated asynchronously for data durability
6. Updated state returned to frontend for UI updates

## Service Roles and Responsibilities

### React Frontend Service
- **Primary Role**: User interface and experience management
- **Responsibilities**:
  - Render responsive, interactive user interface
  - Handle client-side routing and navigation
  - Manage local application state
  - Communicate with backend APIs
  - Implement gamification elements (animations, feedback)
- **Technology Stack**: React 18, React Router, Tailwind CSS, Framer Motion
- **Communication**: HTTP REST calls to Django backend

### Django Backend Service
- **Primary Role**: API server and business logic processor
- **Responsibilities**:
  - Expose RESTful API endpoints
  - Implement authentication and authorization
  - Process business logic for learning algorithms
  - Manage user progress and game mechanics
  - Validate data integrity and enforce business rules
- **Technology Stack**: Django 5.2, Django REST Framework, JWT
- **Communication**: Database queries to PostgreSQL, caching operations with Redis

### PostgreSQL Database Service
- **Primary Role**: Primary data persistence layer
- **Responsibilities**:
  - Store user accounts and profiles
  - Persist lesson content and structure
  - Maintain user progress and achievements
  - Store game state and village configurations
  - Ensure data consistency and transaction integrity
- **Technology Stack**: PostgreSQL 16 with UTF-8 encoding
- **Features**: ACID compliance, advanced indexing, full-text search capabilities

### Redis Cache Service
- **Primary Role**: High-performance caching and session management
- **Responsibilities**:
  - Cache frequently accessed lesson content
  - Store user session data for fast authentication
  - Maintain real-time game state for immediate responsiveness
  - Rate limiting and temporary data storage
  - Support pub/sub for real-time features
- **Technology Stack**: Redis 7 with persistence enabled
- **Features**: In-memory operations, data expiration, atomic operations

## Docker and Containerization Benefits

### Isolation and Consistency
- **Process Isolation**: Each service runs in its own container with dedicated resources
- **Environment Consistency**: Same environment across development, testing, and production
- **Dependency Management**: All dependencies packaged within containers
- **Version Control**: Container images provide versioned, immutable deployment artifacts

### Scalability and Performance
- **Horizontal Scaling**: Services can be scaled independently based on load
- **Resource Optimization**: Containers use resources more efficiently than VMs
- **Load Distribution**: Multiple backend instances can run behind load balancer
- **Database Scaling**: Database can use read replicas and connection pooling

### Deployment and Operations
- **Simplified Deployment**: Single command deployment with docker-compose
- **Health Monitoring**: Built-in health checks ensure service reliability
- **Rolling Updates**: Zero-downtime deployments with container orchestration
- **Environment Management**: Easy switching between development and production configurations

## Scalability and Deployment Considerations

### Horizontal Scaling Strategies

**Frontend Scaling:**
- Deploy to CDN for global content distribution
- Use multiple frontend instances behind load balancer
- Implement client-side caching strategies

**Backend Scaling:**
- Run multiple Django instances with load balancing
- Use database connection pooling for efficient resource usage
- Implement API rate limiting to prevent abuse

**Database Scaling:**
- PostgreSQL read replicas for read-heavy operations
- Redis clustering for cache distribution
- Database partitioning for large datasets

### Production Deployment Architecture

```
Internet → CDN/Load Balancer → Multiple Backend Instances → Database Cluster
                ↓
        Static Assets Cache     Redis Cluster      PostgreSQL Primary + Replicas
```

### Monitoring and Observability
- Health check endpoints for each service
- Container-level resource monitoring
- Application-level performance metrics
- Centralized logging with structured log formats

### Security Considerations
- Network isolation between services
- Secrets management via environment variables
- Database connection encryption
- JWT token validation and expiration
- CORS configuration for cross-origin requests

This architecture supports the educational platform's requirements while maintaining flexibility for future enhancements and scaling needs.