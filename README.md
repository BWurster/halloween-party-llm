# Hallowen Party LLM

This halloween I am dressing up as ChatGPT! My costume will have a QR code that redirects to this site. In essence this is a locally hosted LLM with an API chat interface to a React frontend.

## Quickstart

Add cached Ollama `llama3.2` model to this directory. It should have the following folder structure.
```
models/
├── blobs/
└── manifests/
```

Build the image. This will be a large image, having the full LLM from Ollama. However, baking this all into the image will significantly speed up launch.
```bash
docker build -t myapp:latest .
```

Run the app. It is accessed on port 80 and requires port 8000 to hit the API
```bash
docker run -p 80:80 -p 8000:8000 myapp:latest
```
