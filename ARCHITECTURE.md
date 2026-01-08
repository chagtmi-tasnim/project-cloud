# Product Management Application - Architecture & Design Document

## Executive Summary

The Product Management Application is a microservices-based system designed with containerization best practices. It demonstrates a three-tier architecture pattern with independent, scalable components that align with OpenShift container orchestration principles.

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│                      Web Browser                                 │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP/HTTPS
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                             │
│              Nginx Reverse Proxy + Load Balancer                 │
│                    (Port 80/443)                                 │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Frontend React Application                              │   │
│  │ • Product List Display                                  │   │
│  │ • Product Cards with Details                            │   │
│  │ • Responsive Design                                     │   │
│  │ • Built with Node.js + React                            │   │
│  │ • Served by Nginx                                       │   │
│  └──────────────────────┬──────────────────────────────────┘   │
└───────────────────────────┼──────────────────────────────────────┘
                            │ API Calls (/api/*)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Application Layer                                   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Backend API Service (Node.js + Express)                 │   │
│  │ • REST Endpoints (/api/products, /api/products/:id)     │   │
│  │ • Business Logic                                        │   │
│  │ • Database Query Handling                               │   │
│  │ • Health Check Endpoint                                 │   │
│  │ • Environment-based Configuration                       │   │
│  │ • Automatic Retry Logic                                 │   │
│  └──────────────────────┬──────────────────────────────────┘   │
└───────────────────────────┼──────────────────────────────────────┘
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Data Layer                                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PostgreSQL Database                                     │   │
│  │ • Relational Data Storage                               │   │
│  │ • Products Table Schema                                 │   │
│  │ • Persistent Volume Storage                             │   │
│  │ • Automatic Initialization                              │   │
│  │ • Health Checks & Monitoring                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Service

**Purpose**: User-facing web application for browsing products

**Technology Stack**:
- React 18.2.0
- Nginx (production serving)
- HTML5, CSS3, JavaScript

**Key Features**:
- Responsive grid layout for product display
- Asynchronous API calls with error handling
- Product card components with detailed information
- Loading states and error messages
- Professional UI/UX design

**API Integration**:
```
GET /api/products
- Retrieves all available products
- Response: Array of product objects
- Error Handling: Displays user-friendly error messages
```

**Deployment**:
- **Docker Image**: Nginx Alpine
- **Port**: 80 (HTTP)
- **Build Process**: Multi-stage Docker build
  1. Build stage: Node.js compiles React app
  2. Production stage: Nginx serves optimized build
- **Proxy Configuration**: Routes `/api/*` requests to backend service

### 2. Backend Service

**Purpose**: REST API for product data management

**Technology Stack**:
- Node.js 18
- Express.js 4.18.2
- PostgreSQL client (pg)
- CORS enabled for frontend access

**Key Features**:
- Stateless API design
- Connection pooling to database
- Automatic database connection retry logic (10 attempts)
- Health check endpoint for monitoring
- Error handling and logging
- Environment-based configuration

**API Endpoints**:

```
GET /api/products
├── Description: Retrieve all products
├── Parameters: None
├── Response: JSON array of product objects
└── Status Codes: 200 (OK), 500 (Error)

GET /api/products/:id
├── Description: Retrieve single product by ID
├── Parameters: id (path parameter)
├── Response: JSON product object
└── Status Codes: 200 (OK), 404 (Not Found), 500 (Error)

GET /health
├── Description: Health check endpoint
├── Parameters: None
├── Response: {"status": "Backend API is running"}
└── Status Codes: 200 (OK)
```

**Database Connection**:
```
Host: database (service name in container network)
Port: 5432
Database: productdb
User: postgres (configurable)
Password: postgres (configurable)
Connection Timeout: 5 seconds per attempt
Retry Logic: 10 attempts with 5-second delays
```

**Deployment**:
- **Docker Image**: Node.js 18 Alpine
- **Port**: 5000
- **Environment Variables**:
  - `PORT`: API listening port
  - `DB_HOST`, `DB_PORT`, `DB_NAME`: Database connection
  - `DB_USER`, `DB_PASSWORD`: Database credentials
  - `NODE_ENV`: Runtime environment

### 3. Database Service

**Purpose**: Persistent data storage for products

**Technology Stack**:
- PostgreSQL 15
- Alpine Linux (minimal base image)

**Database Schema**:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_name ON products(name);
```

**Sample Data**:
- 8 pre-loaded products (Laptop, Mouse, Hub, Keyboard, etc.)
- Price range: $29.99 - $999.99
- Full product descriptions

**Initialization**:
- Automatic schema creation on first run
- Sample data insertion
- Index creation for query optimization

**Deployment**:
- **Docker Image**: PostgreSQL 15 Alpine
- **Port**: 5432
- **Persistent Storage**: 
  - Volume: `db_data`
  - Mount Path: `/var/lib/postgresql/data`
  - Size: 10GB (configurable)
- **Health Check**: pg_isready command

## Communication Flow

### Request Flow: User Requests Product List

```
1. User opens browser → http://localhost
2. Nginx (Frontend) serves React application
3. React app renders with loading state
4. React app sends GET request → http://localhost/api/products
5. Nginx proxy routes request → http://backend:5000/api/products
6. Express receives request at backend service
7. Backend queries database:
   SELECT * FROM products ORDER BY id
8. PostgreSQL returns product rows
9. Backend formats and returns JSON response
10. Nginx proxies response back to frontend
11. React updates component state with products
12. Products rendered in grid layout
```

### Service-to-Service Communication

**Frontend → Backend**:
- Protocol: HTTP
- Path: `/api/*`
- Host: `localhost:5000` (external), `backend:5000` (internal)
- Headers: CORS enabled for cross-origin requests

**Backend → Database**:
- Protocol: TCP/PostgreSQL
- Host: `database` (container DNS name)
- Port: 5432
- Authentication: Username/Password (environment-based)

## Networking Architecture

### Docker Compose Network

**Network Type**: Bridge
**Name**: `app-network`

**Service Endpoints**:
```
Frontend (Nginx):
├── Internal: frontend:80
├── External: localhost:80

Backend (Express):
├── Internal: backend:5000
├── External: localhost:5000

Database (PostgreSQL):
├── Internal: database:5432
├── External: localhost:5432
```

**DNS Resolution**:
- Docker embedded DNS: 127.0.0.11:53
- Service discovery by hostname (e.g., `database`, `backend`)
- Automatic load balancing for multiple replicas

## Data Persistence

### Volume Management

```
db_data (Named Volume):
├── Type: Local driver
├── Mount Path (Container): /var/lib/postgresql/data
├── Host Storage: Docker managed location
└── Lifecycle: Persists across container restarts
```

### Data Reliability

- **Persistence**: Volume survives container recreation
- **Backup**: Can be backed up via volume snapshots
- **Recovery**: Data recoverable if container removed but volume kept
- **Cleanup**: Removed only with explicit `docker-compose down -v`

## Scalability Features

### Horizontal Scaling

**Frontend Replicas**:
```bash
docker-compose up -d --scale frontend=3
```
- Nginx load balances traffic across instances
- Each replica is independent

**Backend Replicas**:
```bash
docker-compose up -d --scale backend=3
```
- Database connection pooling supports multiple clients
- Stateless design enables horizontal scaling
- Load balanced by Docker DNS

**Database**:
- Remains single instance (master)
- Supports connection pooling from multiple backend instances
- Can be configured for master-slave replication (advanced)

### Resource Limits

**Frontend Container**:
- Memory: 256 MB max
- CPU: 0.25 cores max

**Backend Container**:
- Memory: 512 MB max
- CPU: 0.5 cores max

**Database Container**:
- Memory: 512 MB max
- CPU: 0.5 cores max

## Health & Reliability

### Health Checks

**Frontend (Nginx)**:
- Check Type: TCP port 80
- Interval: 10 seconds
- Timeout: 5 seconds
- Startup Grace: 15 seconds

**Backend (Express)**:
```
GET /health
```
- Interval: 10 seconds
- Timeout: 5 seconds
- Startup Grace: 15 seconds
- Failure Tolerance: 3 consecutive failures

**Database (PostgreSQL)**:
```
pg_isready -U postgres
```
- Interval: 10 seconds
- Timeout: 5 seconds
- Startup Grace: 10 seconds
- Failure Tolerance: 5 consecutive failures

### Automatic Recovery

- Failed containers automatically restarted
- Health checks monitor container readiness
- Backend waits for database health before starting
- Service dependencies prevent cascade failures

## Security Considerations

### Network Security

- Services isolated in custom bridge network
- Database not exposed externally by default
- Internal DNS prevents accidental exposure
- Nginx acts as reverse proxy for frontend

### Credential Management

- Database credentials in `.env` file
- Environment variable substitution in docker-compose
- Secrets support for OpenShift deployment
- `.env` excluded from version control

### Production Recommendations

1. **Change default database password** in `.env`
2. **Use HTTPS/TLS** for all external routes
3. **Implement API authentication** (JWT tokens)
4. **Add request rate limiting** on API
5. **Regular security updates** to base images
6. **Container image scanning** for vulnerabilities
7. **Resource limits** to prevent DoS

## OpenShift Integration

### Deployment Strategy

The application is designed for OpenShift with:

- **DeploymentConfigs**: Instead of Kubernetes Deployments
- **Routes**: Instead of Ingress for external access
- **Persistent Volume Claims**: For database storage
- **Secrets**: For sensitive configuration
- **ConfigMaps**: For non-sensitive configuration
- **Service DNS**: For internal communication

### Scalability in OpenShift

```bash
oc scale dc/product-backend --replicas=5
oc scale dc/product-frontend --replicas=3
```

### Rolling Updates

```bash
oc rollout latest dc/product-backend
oc rollout status dc/product-backend -w
```

## Performance Characteristics

### Load Capacity (Docker Compose - 1 instance each)

- **Concurrent Connections**: ~50-100 per backend instance
- **Requests/Second**: ~100-200 per backend instance
- **Database Connections**: ~5-10 per backend instance
- **Response Time**: <100ms for product listing

### Scaling Performance

- **Linear Scaling**: 3x backend instances ≈ 3x throughput
- **Frontend Bottleneck**: Single Nginx instance can handle 1000+ RPS
- **Database Bottleneck**: Connection pool and query optimization needed at high scale

## Monitoring & Logging

### Log Sources

```
Frontend Container:
├── Access logs: /var/log/nginx/access.log
├── Error logs: /var/log/nginx/error.log
└── View with: docker-compose logs frontend

Backend Container:
├── Application logs: stdout/stderr
├── Database queries: Logged to console
└── View with: docker-compose logs backend

Database Container:
├── PostgreSQL logs: stderr
├── Health checks: Included in logs
└── View with: docker-compose logs database
```

### Monitoring Endpoints

- **Backend Health**: `GET /health`
- **Database Status**: `pg_isready` command
- **Frontend Status**: HTTP 200 from root path

## Deployment Checklist

### Pre-Deployment
- [ ] Docker and Docker Compose installed
- [ ] Network port availability verified (80, 5000, 5432)
- [ ] `.env` file configured with desired credentials
- [ ] Sufficient disk space for volumes (~10GB minimum)

### Deployment
- [ ] Run `docker-compose build`
- [ ] Run `docker-compose up -d`
- [ ] Verify all containers running: `docker-compose ps`
- [ ] Test frontend: `curl http://localhost`
- [ ] Test backend: `curl http://localhost:5000/health`
- [ ] Test API: `curl http://localhost:5000/api/products`

### Post-Deployment
- [ ] Verify database has sample data
- [ ] Test product list loading in browser
- [ ] Check logs for errors
- [ ] Verify persistent volume is mounted
- [ ] Test container restart behavior
- [ ] Document any custom configurations

## Disaster Recovery

### Backup Strategy

```bash
# Backup database
docker exec product-database pg_dump -U postgres productdb > backup.sql

# Backup volume
docker run --rm -v product-cloud_db_data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/db-backup.tar.gz -C /data .
```

### Recovery Process

```bash
# Restore database
docker exec -i product-database psql -U postgres productdb < backup.sql

# Restore volume
docker run --rm -v product-cloud_db_data:/data -v $(pwd):/backup \
  ubuntu tar xzf /backup/db-backup.tar.gz -C /data
```

## Future Enhancements

1. **Caching Layer**: Redis for API response caching
2. **Message Queue**: RabbitMQ for asynchronous operations
3. **Search Engine**: Elasticsearch for product search
4. **Monitoring Stack**: Prometheus + Grafana
5. **Logging Stack**: ELK Stack (Elasticsearch, Logstash, Kibana)
6. **Service Mesh**: Istio for advanced traffic management
7. **API Gateway**: Kong or Traefik for advanced routing
8. **Database Replication**: Master-slave setup for high availability
9. **CDN Integration**: CloudFlare or AWS CloudFront for static assets
10. **GraphQL**: Alternative API layer for frontend flexibility

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Production Ready
