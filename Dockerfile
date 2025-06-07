# --- Build frontend (Next.js export) ---
FROM node:20-alpine AS frontend-builder

WORKDIR /app/skyeye-frontend
COPY skyeye-frontend/package*.json ./
RUN npm install
COPY skyeye-frontend ./
RUN npm run build

# --- Build backend (FastAPI) ---
FROM python:3.11-slim AS backend
WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code & resources
COPY api.py .
COPY resources/ ./resources/

# Copy exported frontend
COPY --from=frontend-builder /app/skyeye-frontend/.next ./skyeye-frontend/.next
COPY --from=frontend-builder /app/skyeye-frontend/public ./skyeye-frontend/public
COPY --from=frontend-builder /app/skyeye-frontend/package.json ./skyeye-frontend/package.json

EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]