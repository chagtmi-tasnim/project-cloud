# Product Management Application - Testing & Verification Guide

## Pre-Deployment Testing

Before running the application, verify your environment is ready:

### 1. System Requirements Check

```powershell
# Windows PowerShell
docker --version        # Should be 20.10 or higher
docker-compose --version # Should be 1.29 or higher
```

```bash
# Linux/Mac
docker --version
docker-compose --version
```

**Required**: Docker 20.10+, Docker Compose 1.29+

### 2. Disk Space Verification

```powershell
# Windows PowerShell
Get-PSDrive C

# Check available space - should be at least 10GB
```

```bash
# Linux/Mac
df -h
# Should show at least 10GB available
```

### 3. Port Availability

```powershell
# Windows - Check if ports are available
netstat -ano | findstr :80
netstat -ano | findstr :5000
netstat -ano | findstr :5432

# If ports are in use, stop the blocking process or modify ports in docker-compose.yaml
```

```bash
# Linux/Mac
lsof -i :80
lsof -i :5000
lsof -i :5432
```

## Deployment Testing

### Step 1: Build Phase Testing

```bash
# Navigate to project directory
cd "c:\Users\user\Desktop\senior\cloud\project cloud"

# Build all images
docker-compose build

# Verify successful build
docker images | grep product
```

**Expected Output**:
```
product-cloud-database   latest    xxx    xx    xxx    xxx
product-cloud-backend    latest    xxx    xx    xxx    xxx
product-cloud-frontend   latest    xxx    xx    xxx    xxx
```

### Step 2: Startup Testing

```bash
# Start services
docker-compose up -d

# Wait 30 seconds for services to initialize
timeout 30

# Check service status
docker-compose ps
```

**Expected Status**:
```
NAME                    STATUS
product-database        Up (healthy)
product-backend         Up (healthy)
product-frontend        Up (healthy)
```

### Step 3: Network Connectivity Testing

```bash
# Test database connectivity from backend
docker exec product-backend sh -c "nc -zv database 5432"

# Test backend connectivity from frontend
docker exec product-frontend sh -c "curl -s http://backend:5000/health"
```

**Expected Results**:
- Database: Connection successful
- Backend: `{"status":"Backend API is running"}`

## API Testing

### Health Check Endpoints

```bash
# Test backend health
curl http://localhost:5000/health

# Expected response:
# {"status":"Backend API is running"}
```

### Product Endpoints

```bash
# Get all products
curl http://localhost:5000/api/products

# Expected response:
# [
#   {
#     "id": 1,
#     "name": "Laptop",
#     "description": "...",
#     "price": 999.99,
#     "created_at": "2024-01-08T10:00:00Z"
#   },
#   ...
# ]

# Get single product
curl http://localhost:5000/api/products/1

# Expected response:
# {
#   "id": 1,
#   "name": "Laptop",
#   "description": "High-performance laptop with 16GB RAM and 512GB SSD",
#   "price": 999.99,
#   "created_at": "2024-01-08T10:00:00Z"
# }

# Get non-existent product (should return 404)
curl http://localhost:5000/api/products/999

# Expected response: 404 Not Found
# {"error":"Product not found"}
```

### Frontend Testing

```bash
# Test frontend accessibility
curl http://localhost

# Expected: HTML content of React application
```

## Browser Testing

1. **Open Browser**: Navigate to `http://localhost`
2. **Expected Results**:
   - Page loads successfully
   - Header displays "📦 Product Management"
   - Product grid appears with 8 products
   - Each product card shows:
     - Product name
     - Description
     - Price
     - Product ID

### Interaction Testing

1. **Scroll through products**: Verify responsive design
2. **Hover over product cards**: Check hover effects (card elevation)
3. **Check responsive design**: Resize browser window to verify mobile layout
4. **Verify API calls**: Open browser DevTools (F12) → Network tab
   - Check network requests to `/api/products`
   - Verify response includes all 8 products

## Database Testing

### Direct Database Access

```bash
# Access PostgreSQL directly
docker exec -it product-database psql -U postgres -d productdb

# Inside PostgreSQL shell:
\dt                    # List tables
SELECT * FROM products;  # View all products
\d products            # Show table schema
SELECT COUNT(*) FROM products;  # Count products
\q                     # Exit PostgreSQL
```

**Expected Results**:
- 8 sample products in database
- Correct schema with columns: id, name, description, price, created_at, updated_at

### Data Persistence Testing

```bash
# Stop and remove containers (keeping volumes)
docker-compose down

# Check volume still exists
docker volume ls | grep product

# Restart services
docker-compose up -d

# Verify data still exists
curl http://localhost:5000/api/products

# Should return same 8 products
```

## Error Handling Testing

### Backend Error Scenarios

```bash
# Invalid product ID (non-numeric)
curl http://localhost:5000/api/products/abc
# Expected: 500 error or 404

# Invalid endpoint
curl http://localhost:5000/api/invalid
# Expected: 404 Not Found

# Frontend with broken backend (simulate)
docker-compose stop backend
curl http://localhost:5000/api/products
# Expected: Connection refused or timeout

# Restart backend
docker-compose start backend
```

### Frontend Error Handling

1. **Open browser DevTools** (F12)
2. **Open Console tab**
3. **Stop backend**: `docker-compose stop backend`
4. **Refresh page**: Verify error message displays correctly
5. **Restart backend**: `docker-compose start backend`
6. **Refresh page**: Verify products load again

## Load Testing

### Simple Load Test with cURL

```bash
# Test 100 requests
for i in {1..100}; do
  curl http://localhost:5000/api/products > /dev/null
done

# Check if backend is still responding
curl http://localhost:5000/health
```

### Using Apache Bench (if installed)

```bash
# Test with 100 concurrent connections, 1000 total requests
ab -n 1000 -c 100 http://localhost:5000/api/products

# Expected: All requests complete successfully
```

### Using Docker Stats for Resource Monitoring

```bash
# Monitor container resource usage
docker stats product-backend

# Expected: CPU and memory within limits defined in docker-compose.yaml
```

## Scaling Testing

### Scale Backend to Multiple Instances

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Verify containers
docker-compose ps

# Test load distribution
for i in {1..50}; do
  curl http://localhost:5000/api/products > /dev/null
done

# View logs from all backend instances
docker-compose logs backend

# Scale back to 1
docker-compose up -d --scale backend=1
```

## Container Lifecycle Testing

### Restart Testing

```bash
# Verify container automatically restarts on failure
# Test 1: Manually stop backend
docker-compose stop backend
docker-compose ps  # Should show backend as stopped

# Wait and restart
docker-compose start backend
docker-compose ps  # Should show backend as up

# Test 2: Kill a backend process
BACKEND_CONTAINER=$(docker-compose ps -q backend)
docker kill $BACKEND_CONTAINER

# Docker should automatically restart
sleep 5
docker-compose ps  # Should show backend as up again
```

### Volume Persistence Testing

```bash
# Add custom data to database
docker exec product-database psql -U postgres -d productdb -c \
  "INSERT INTO products (name, description, price) VALUES ('Test Product', 'Test', 99.99);"

# Stop and remove containers
docker-compose down

# Check container is gone but volume remains
docker container ls -a | grep product  # Should be empty
docker volume ls | grep product-cloud   # Should exist

# Restart
docker-compose up -d

# Verify custom data persists
curl http://localhost:5000/api/products | grep "Test Product"
# Should find the test product
```

## Performance Testing

### Response Time Measurement

```bash
# Measure response time
time curl http://localhost:5000/api/products > /dev/null

# Expected: < 100ms under normal load
```

### Database Query Performance

```bash
# Access database
docker exec -it product-database psql -U postgres -d productdb

# Run query with timing
\timing on
SELECT * FROM products ORDER BY id;

# Expected: < 10ms for 8 products
```

## Logging & Diagnostics

### View All Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f database
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend

# Logs since specific time
docker-compose logs --since 10m backend
```

### Inspect Container Configuration

```bash
# View environment variables
docker inspect product-backend | grep -A 20 "Env"

# View port mappings
docker inspect product-backend | grep -A 5 "Ports"

# View volume mounts
docker inspect product-database | grep -A 10 "Mounts"
```

## Troubleshooting Tests

### Service Won't Start

```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready: Wait longer for health check
# 2. Port already in use: Change port in docker-compose.yaml
# 3. Out of disk space: Free up disk space
```

### Frontend Can't Reach Backend

```bash
# Test from frontend container
docker exec product-frontend curl http://backend:5000/health

# If fails:
# 1. Check backend is running: docker-compose ps
# 2. Check network: docker network ls | grep product
# 3. Verify network connectivity: docker network inspect app-network
```

### Database Connection Timeout

```bash
# Check database is healthy
docker-compose ps database

# If not healthy:
# 1. Check logs: docker-compose logs database
# 2. Verify environment variables: docker exec product-database env | grep POSTGRES
# 3. Check disk space: docker exec product-database df -h
```

## Cleanup Testing

### Remove Everything Safely

```bash
# Stop and remove containers (keeps volumes)
docker-compose down

# Stop, remove containers AND volumes
docker-compose down -v

# Verify cleanup
docker container ls | grep product  # Should be empty
docker volume ls | grep product     # Should be empty
```

## Automated Testing Script

```bash
#!/bin/bash
# save as test.sh and run: bash test.sh

echo "=== Product Management App - Comprehensive Test Suite ==="
echo ""

# Test 1: Check prerequisites
echo "[TEST 1] Checking prerequisites..."
docker --version && echo "✓ Docker OK" || echo "✗ Docker FAILED"
docker-compose --version && echo "✓ Docker Compose OK" || echo "✗ Docker Compose FAILED"

# Test 2: Build images
echo ""
echo "[TEST 2] Building Docker images..."
docker-compose build && echo "✓ Build OK" || echo "✗ Build FAILED"

# Test 3: Start services
echo ""
echo "[TEST 3] Starting services..."
docker-compose up -d && echo "✓ Startup OK" || echo "✗ Startup FAILED"
sleep 30

# Test 4: Check container status
echo ""
echo "[TEST 4] Verifying container health..."
docker-compose ps
HEALTHY=$(docker-compose ps | grep -c "Up")
if [ "$HEALTHY" -eq 3 ]; then
  echo "✓ All containers healthy"
else
  echo "✗ Some containers not healthy"
fi

# Test 5: Health check
echo ""
echo "[TEST 5] Testing health endpoints..."
HEALTH=$(curl -s http://localhost:5000/health)
if echo "$HEALTH" | grep -q "Backend API is running"; then
  echo "✓ Backend health check OK"
else
  echo "✗ Backend health check FAILED"
fi

# Test 6: API test
echo ""
echo "[TEST 6] Testing API endpoints..."
PRODUCTS=$(curl -s http://localhost:5000/api/products)
COUNT=$(echo "$PRODUCTS" | grep -o '"id"' | wc -l)
echo "✓ API returns $COUNT products"

if [ "$COUNT" -eq 8 ]; then
  echo "✓ Correct number of products"
else
  echo "✗ Expected 8 products, got $COUNT"
fi

# Test 7: Frontend test
echo ""
echo "[TEST 7] Testing frontend..."
FRONTEND=$(curl -s http://localhost | grep -c "Product Management")
if [ "$FRONTEND" -gt 0 ]; then
  echo "✓ Frontend accessible"
else
  echo "✗ Frontend not responding"
fi

# Test 8: Database test
echo ""
echo "[TEST 8] Testing database..."
DB_TEST=$(docker exec product-database psql -U postgres -d productdb -c "SELECT COUNT(*) FROM products;" 2>&1)
if echo "$DB_TEST" | grep -q "8"; then
  echo "✓ Database contains 8 products"
else
  echo "✗ Database query FAILED"
fi

echo ""
echo "=== Test Suite Complete ==="
```

## Test Results Summary

Create a test results file to document findings:

```markdown
# Test Results - [DATE]

## Environment
- Docker Version: x.xx.x
- Docker Compose Version: x.xx.x
- OS: Windows/Linux/Mac

## Test Results

### Build Phase
- [ ] Images build successfully
- [ ] Image sizes reasonable (frontend < 200MB, backend < 300MB)
- [ ] No security warnings in build

### Startup Phase
- [ ] All containers start within 60 seconds
- [ ] Database health check passes
- [ ] Backend health check passes
- [ ] Frontend becomes accessible

### API Testing
- [ ] GET /api/products returns 8 products
- [ ] GET /api/products/:id returns correct product
- [ ] Invalid product ID returns 404
- [ ] Response time < 100ms

### Frontend Testing
- [ ] Page loads successfully
- [ ] All 8 products displayed
- [ ] Product cards styled correctly
- [ ] Responsive design works (tested at 320px, 768px, 1024px)

### Database Testing
- [ ] Database contains 8 sample products
- [ ] Data persists after container restart
- [ ] Can directly query database

### Error Handling
- [ ] Frontend handles missing backend
- [ ] Backend handles missing database
- [ ] Proper error messages displayed

### Performance
- [ ] Response time acceptable
- [ ] Container resource usage within limits
- [ ] Scaling test successful

## Issues Found
- [ ] None
- [ ] [List any issues encountered]

## Notes
[Any additional observations or configuration changes]
```

---

**Test Guide Version**: 1.0  
**Last Updated**: January 2026
