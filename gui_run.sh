#!/bin/bash

# Exit on error
set -e

# ---- Backend setup ----
echo "Setting up Python virtual environment..."
python3 -m venv .venv
source .venv/bin/activate
echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Starting backend (Uvicorn)..."
uvicorn api:app --reload &
BACKEND_PID=$!
echo "Backend started with PID $BACKEND_PID"

# ---- Frontend setup ----
cd skyeye-frontend

echo "Installing frontend dependencies..."
npm install

echo "Building frontend (npm run build)..."
npm run build

echo "Starting frontend (npm run start)..."
npm start &
FRONTEND_PID=$!
echo "Frontend started with PID $FRONTEND_PID"

# ---- Handle termination ----
trap "echo 'Stopping processes...'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT

# Wait for background jobs
wait $BACKEND_PID $FRONTEND_PID