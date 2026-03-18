import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/api";

function buildFallbackReply(message, pathname) {
  const text = (message || "").toLowerCase();

  if (text.includes("booking") || text.includes("approve") || text.includes("pending")) {
    return "You can manage pending and approved requests in the Bookings page. Use status filters to find items quickly.";
  }

  if (text.includes("resource") || text.includes("room") || text.includes("lab")) {
    return "Resources can be created and updated in the Resources page. Keep item status ACTIVE for booking availability.";
  }

  if (text.includes("user") || text.includes("admin") || text.includes("role")) {
    return "User and role visibility are available in the Users page for admins.";
  }

  if (text.includes("where") || text.includes("page") || text.includes("here")) {
    return `You are currently on ${pathname}. I can help with quick navigation and operations tips.`;
  }

  return "I can help with bookings, resources, user access, and page navigation. Ask me what you need to do.";
}

function AiChatbotPopup() {
  const location = useLocation();
  const chatBottomRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I am MOLA AI Assistant. Ask me anything about bookings, resources, and operations.",
      createdAt: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isLoading, isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const context = {
      page: location.pathname,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.post("/ai/chat", {
        message: trimmed,
        context,
      });

      const assistantText =
        response?.data?.reply ||
        response?.data?.message ||
        buildFallbackReply(trimmed, location.pathname);

      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: assistantText,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (_err) {
      setMessages((previous) => [
        ...previous,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: "assistant",
          text: buildFallbackReply(trimmed, location.pathname),
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <section className="fixed bottom-24 right-4 z-[70] w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-cyan-300/30 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur sm:right-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">AI Operations Chatbot</h2>
              <p className="text-xs text-slate-300">Ask from any page in MOLA.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-100">
                {isLoading ? "Thinking..." : "Ready"}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-white/20 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
                aria-label="Close AI chatbot"
              >
                Close
              </button>
            </div>
          </div>

          <div className="h-[300px] overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-cyan-500/30 text-cyan-50"
                      : "border border-white/10 bg-white/10 text-slate-100"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-2 flex justify-start">
                <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-300">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything about MOLA"
              className="w-full rounded-xl border border-white/15 bg-slate-900/60 px-4 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-cyan-300/60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-cyan-500/80 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="fixed bottom-6 right-4 z-[70] rounded-full border border-cyan-300/40 bg-cyan-500/90 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:bg-cyan-400 sm:right-6"
        aria-label="Toggle AI chatbot"
      >
        {isOpen ? "Hide AI Chat" : "AI Chat"}
      </button>
    </>
  );
}

export default AiChatbotPopup;
