#!/bin/bash
set -Eeuo pipefail

APP_DIR="/opt/trainmeter/app"
BRANCH="main"

echo "==> Starting deploy"
cd "$APP_DIR"

echo "==> Current branch:"
git branch --show-current

echo "==> Fetch latest changes"
git fetch origin

echo "==> Checkout $BRANCH"
git checkout "$BRANCH"

echo "==> Pull latest $BRANCH"
git pull origin "$BRANCH"

echo "==> Rebuild and start containers"
docker compose up -d --build

echo "==> Current containers"
docker compose ps

echo "==> Deploy finished successfully"