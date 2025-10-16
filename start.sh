#!/bin/bash
set -e

echo "Starting Ollama server..."
# Start Ollama server in the background
ollama serve >/dev/null 2>&1 &

echo "Waiting for Ollama server to start..."
# Wait a few seconds for server to start
sleep 5

echo "Pulling models..."
# Pull the models you need
ollama pull llama3.2
# ollama pull gpt4all  # add more if needed

echo "Starting Nginx and Uvicorn..."
# Start supervisord to run Nginx and Uvicorn
# Start Supervisor
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

