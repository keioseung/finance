# Use Node.js for Next.js frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund

COPY . .
RUN npm run build

# Use Python for backend
FROM python:3.11-slim

WORKDIR /app

# Install Node.js for serving frontend (optimized)
RUN apt-get update && \
    apt-get install -y --no-install-recommends nodejs npm && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy frontend build
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package*.json ./
COPY --from=frontend-builder /app/next.config.js ./

# Copy backend
COPY backend/ ./backend/
COPY requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install frontend dependencies for production
RUN npm ci --only=production --no-audit --no-fund

# Expose port
EXPOSE 8000

# Start both frontend and backend
CMD ["python", "backend/main.py"] 