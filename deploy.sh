#!/bin/bash

# Manual deployment script for GCP Cloud Run
# This script is an alternative to GitHub Actions for manual deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID}"
SERVICE_NAME="dsqm-conservation-api"
REGION="us-central1"
REGISTRY="us-central1-docker.pkg.dev"

echo -e "${GREEN}Starting deployment to Google Cloud Run${NC}"

# Check if PROJECT_ID is set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: GCP_PROJECT_ID environment variable is not set${NC}"
    echo "Please set it with: export GCP_PROJECT_ID=your-project-id"
    exit 1
fi

# Set the project
echo -e "${YELLOW}Setting GCP project to: $PROJECT_ID${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${YELLOW}Enabling required GCP APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    sqladmin.googleapis.com

# Configure Docker authentication
echo -e "${YELLOW}Configuring Docker for Artifact Registry...${NC}"
gcloud auth configure-docker $REGISTRY

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
IMAGE_TAG="$REGISTRY/$PROJECT_ID/cloud-run/$SERVICE_NAME:$(date +%Y%m%d-%H%M%S)"
IMAGE_LATEST="$REGISTRY/$PROJECT_ID/cloud-run/$SERVICE_NAME:latest"

docker build \
    --platform linux/amd64 \
    --tag $IMAGE_TAG \
    --tag $IMAGE_LATEST \
    .

# Push to Artifact Registry
echo -e "${YELLOW}Pushing image to Artifact Registry...${NC}"
docker push $IMAGE_TAG
docker push $IMAGE_LATEST

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_TAG \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --min-instances 1 \
    --max-instances 10 \
    --cpu 2 \
    --memory 2Gi \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars "NODE_ENV=production"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --format 'value(status.url)')

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Service URL: $SERVICE_URL${NC}"