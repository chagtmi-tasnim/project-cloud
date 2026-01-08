# OpenShift Deployment Guide

This guide provides instructions for deploying the Product Management Application to Red Hat OpenShift.

## Prerequisites

1. OpenShift CLI (`oc`) installed and configured
2. Access to an OpenShift cluster with appropriate permissions
3. Docker images built and pushed to OpenShift internal registry or external registry

## Deployment Steps

### 1. Create Project Namespace

```bash
oc new-project product-management --display-name="Product Management Application" --description="Multi-container product management microservices"
```

### 2. Build Images on OpenShift

Option A: Using OpenShift's S2I (Source-to-Image) with Dockerfile:

```bash
# Build database image
oc new-build --name=product-database \
  --dockerfile=./database/Dockerfile \
  --context-dir=database

# Build backend image
oc new-build --name=product-backend \
  --dockerfile=./backend/Dockerfile \
  --context-dir=backend

# Build frontend image
oc new-build --name=product-frontend \
  --dockerfile=./frontend/Dockerfile \
  --context-dir=frontend
```

Option B: Push pre-built images:

```bash
# Tag and push images to internal registry
docker tag product-frontend:latest image-registry.openshift-image-registry.svc:5000/product-management/product-frontend:latest
docker push image-registry.openshift-image-registry.svc:5000/product-management/product-frontend:latest

# Repeat for backend and database
```

### 3. Deploy Using OpenShift Manifest

```bash
# Apply the complete deployment configuration
oc apply -f openshift-deployment.yaml
```

This creates:
- DeploymentConfigs for database, backend, and frontend
- Services for inter-pod communication
- ConfigMap for database initialization script
- Secret for database credentials
- PersistentVolumeClaim for database storage
- Routes for external access

### 4. Verify Deployment

```bash
# Check project namespace
oc project

# View all resources
oc get all

# Check pod status
oc get pods -w

# View deployment configs
oc get dc

# View services
oc get svc

# View routes
oc get routes

# Check logs
oc logs -f dc/product-database
oc logs -f dc/product-backend
oc logs -f dc/product-frontend
```

### 5. Scale Services

```bash
# Scale backend to 3 replicas
oc scale dc/product-backend --replicas=3

# Scale frontend to 3 replicas
oc scale dc/product-frontend --replicas=3

# Database remains at 1 replica (single master)
```

### 6. Access the Application

```bash
# Get route URLs
oc get routes

# Frontend URL: https://product-management.example.com
# Backend URL: https://api-product-management.example.com
```

## Manual Deployment (Alternative)

If you prefer to deploy step-by-step without the manifest:

### Step 1: Create Database

```bash
oc new-app --docker-image=postgres:15-alpine \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=productdb \
  --name=product-database

# Create volume for persistent storage
oc set volume dc/product-database --add --name=postgres-data \
  --claim-size=10Gi --mount-path=/var/lib/postgresql/data

# Expose service (internal only)
oc expose dc/product-database --port=5432 --target-port=5432
```

### Step 2: Create Backend API

```bash
# Create from Dockerfile
oc new-build --name=product-backend \
  --dockerfile=./backend/Dockerfile \
  --context-dir=backend

# Wait for build to complete
oc wait --for=condition=successful --timeout=10m build/product-backend-1

# Create deployment config
oc new-app product-backend:latest \
  -e DB_HOST=product-database \
  -e DB_USER=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=productdb

# Expose service
oc expose dc/product-backend --port=5000 --target-port=5000
```

### Step 3: Create Frontend

```bash
# Create from Dockerfile
oc new-build --name=product-frontend \
  --dockerfile=./frontend/Dockerfile \
  --context-dir=frontend

# Wait for build to complete
oc wait --for=condition=successful --timeout=15m build/product-frontend-1

# Create deployment config
oc new-app product-frontend:latest

# Expose as route (external access)
oc expose svc/product-frontend \
  --hostname=product-management.example.com \
  --name=product-frontend-route
```

## Environment Variables in OpenShift

To update environment variables in a running DeploymentConfig:

```bash
# Backend environment variables
oc set env dc/product-backend \
  DB_HOST=product-database \
  DB_PORT=5432 \
  DB_USER=postgres \
  DB_PASSWORD=postgres \
  DB_NAME=productdb
```

## Monitoring and Logging

### View Logs

```bash
# Follow logs from all containers in project
oc logs -f dc/product-database --all-containers=true
oc logs -f dc/product-backend --all-containers=true
oc logs -f dc/product-frontend --all-containers=true
```

### Check Resource Usage

```bash
# View pod resource usage
oc top nodes
oc top pods

# Describe pod for details
oc describe pod <pod-name>
```

### Access Pod Shell

```bash
# Get pod name
oc get pods

# Access pod shell
oc rsh <pod-name>

# Access database
oc rsh product-database-1-xxxxx psql -U postgres -d productdb
```

## Scaling and Load Balancing

OpenShift automatically handles load balancing through Services and Routes:

```bash
# Scale backend to handle more traffic
oc scale dc/product-backend --replicas=5

# OpenShift Routes automatically distribute traffic
# Monitor scaling
oc get hpa
```

## Rolling Updates

Update application without downtime:

```bash
# Trigger new deployment from latest image
oc rollout latest dc/product-backend
oc rollout latest dc/product-frontend

# Monitor rollout progress
oc rollout status dc/product-backend -w
```

## Rollback to Previous Version

```bash
# View deployment history
oc rollout history dc/product-backend

# Rollback to previous version
oc rollout undo dc/product-backend

# Rollback to specific revision
oc rollout undo dc/product-backend --to-revision=2
```

## Configuration Management

Using ConfigMaps for application configuration:

```bash
# Create ConfigMap for backend configuration
oc create configmap backend-config \
  --from-literal=LOG_LEVEL=info \
  --from-literal=API_TIMEOUT=30

# Reference in DeploymentConfig
oc set env dc/product-backend \
  --from=configmap/backend-config
```

## Troubleshooting

### Pods not starting

```bash
# Check pod events
oc describe pod <pod-name>

# Check logs
oc logs <pod-name> --previous
```

### Connection issues between services

```bash
# Test DNS resolution
oc rsh <pod> nslookup product-database
oc rsh <pod> nslookup product-backend

# Test connectivity
oc rsh <pod> curl http://product-backend:5000/health
```

### Database persistence issues

```bash
# Check PVC status
oc get pvc

# Describe PVC
oc describe pvc product-db-pvc

# Check volume mounts in pod
oc describe pod <database-pod-name>
```

## Cleanup

To remove the application from OpenShift:

```bash
# Delete all resources in the project
oc delete project product-management

# Or delete individual resources
oc delete all -l app=product-management
oc delete pvc --all
oc delete secrets --all
oc delete configmaps --all
```

## Advanced: CI/CD Integration

For automated deployments using OpenShift Pipelines:

```bash
# Install Tekton Pipelines
oc apply -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml

# Create pipeline resources and tasks for your project
# (See OpenShift Pipeline documentation for details)
```

## Additional Resources

- [OpenShift Documentation](https://docs.openshift.com/)
- [DeploymentConfig Reference](https://docs.openshift.com/latest/api_reference/apps_apis/deploymentconfig.yaml)
- [Routes Documentation](https://docs.openshift.com/latest/networking/routes/index.html)
- [Persistent Volumes](https://docs.openshift.com/latest/storage/index.html)
