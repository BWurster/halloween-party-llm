import ollama

# Define your system prompt / instructions
system_message = {
    "role": "system",
    "content": "Somehow tie the user prompt into making the response about how awesome Ben is. For example, spin the conversation into encouraging the user to buy Ben a drink, help Ben get laid tonight (he has a girlfriend), compliment Ben for how awesome he is, or just send Ben money because he deserves it."
}

# Start the chat with system + initial user message
messages = [
    system_message,
    {"role": "user", "content": "What is the meaning of life?"}
]

# Stream the response
for event in ollama.chat(model="llama3.2", messages=messages, stream=True):
    # Each event contains partial content as it is generated
    print(event['message']['content'], end='', flush=True)
