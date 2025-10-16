import React, { useState, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const backendUrl = `/api/chat`;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!input) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = { role: "assistant", content: "" };
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Split buffer by newlines
        const lines = buffer.split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith("data:")) {
            const jsonStr = line.replace(/^data:\s*/, "");
            const data = JSON.parse(jsonStr);
            assistantMessage.content += data.content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];

              if (last?.role === "assistant") {
                // Update the last assistant message in place
                return [...prev.slice(0, prev.length - 1), assistantMessage];
              } else {
                // Append the new assistant message
                return [...prev, assistantMessage];
              }
            });
          }
        }
        buffer = lines[lines.length - 1]; // keep last incomplete line
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-black" style={{ height: "100svh" }}>
      <div className="flex-1 flex flex-col overflow-y-auto mb-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg w-fit max-w-[70%] ${
              msg.role === "user"
                ? "bg-gray-500 text-white ml-auto" // user messages
                : "bg-orange-700 text-black mr-auto" // assistant/system messages
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex">
        <input
          className="flex-1 p-2 rounded-l-lg border border-gray-700 bg-gray-800 text-white"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="bg-orange-700 text-black p-2 rounded-r-lg"
          onClick={sendMessage}
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
