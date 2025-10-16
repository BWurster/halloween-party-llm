# ---------- Stage 1: Build Frontend ----------
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Build production-ready frontend
RUN npm run build  # assumes 'build' outputs to /app/frontend/build

# ---------- Stage 2: Final Image ----------
FROM python:3.12-slim

# Install system dependencies, nginx, supervisor, and Ollama dependencies
RUN apt-get update && \
    apt-get install -y curl git bash build-essential libgomp1 nginx supervisor && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Ollama CLI
RUN curl -fsSL https://ollama.com/install.sh | bash && \
    echo 'export PATH=$PATH:/root/.ollama/bin' >> /etc/profile

# Copy pre-downloaded Ollama model into container
COPY models/blobs /root/.ollama/models/blobs
COPY models/manifests /root/.ollama/models/manifests

# Copy frontend build
COPY --from=frontend-build /app/frontend/build /var/www/html

# Copy backend code
WORKDIR /app/backend
COPY backend/ ./

# Install Python dependencies here
RUN pip install --no-cache-dir -r requirements.txt

# Copy supervisord config and start script
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80 8000
CMD ["/start.sh"]