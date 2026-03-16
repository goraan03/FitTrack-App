#!/bin/bash
set -e

echo "==> Starting deploy"
cd /opt/trainmeter/app

echo "==> Pull latest main"
git fetch origin
git checkout main
git pull origin main

echo "==> Rebuild backend"
docker compose up -d --build server

echo "==> Rebuild frontend"
cd /opt/trainmeter/app/client
docker compose -f docker-compose.prod.yml up -d --build

echo "==> Deploy finished successfully"
