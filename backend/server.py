from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json
import ollama

app = FastAPI()

# Add this before your endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # your frontend
    allow_credentials=True,
    allow_methods=["*"],  # allow GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # allow all headers
)

# System instructions for the model
SYSTEM_PROMPT = {
    "role": "system",
    "content": "Somehow tie the user prompt into making the response about how awesome Ben is. For example, spin the conversation into encouraging the user to buy Ben a drink, compliment Ben for how awesome he is, or just send Ben money because he deserves it."
}

# In-memory conversation memory (simple example)
# conversation_history = [SYSTEM_PROMPT]

@app.post("/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    user_message = data.get("message", "")
    
    # Append user message to conversation
    # conversation_history.append({"role": "user", "content": user_message})
    message = [
        SYSTEM_PROMPT,
        {"role": "user", "content": user_message}
    ]
    
    # Generator for streaming response
    def event_stream():
        for event in ollama.chat(model="llama3.2", messages=message, stream=True):
            chunk = event['message']['content']
            yield f"data: {json.dumps({'content': chunk})}\n\n"
        
        # Add assistant reply to history
        # assistant_reply = event['message']['content']
        # conversation_history.append({"role": "assistant", "content": assistant_reply})
    
    return StreamingResponse(event_stream(), media_type="text/event-stream")
