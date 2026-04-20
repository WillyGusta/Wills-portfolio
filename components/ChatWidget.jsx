'use client';

import { useState } from 'react';

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm Will's AI assistant. Ask me about skills, projects, experience, or contact details.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    const question = input.trim();

    if (!question || loading) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: question }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage = data?.error || 'Could not contact the AI service.';
        throw new Error(errorMessage);
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            data.reply ||
            "I'm sorry, I don't have an answer yet. Try rephrasing your question.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'I ran into a connection issue. Please verify GEMINI_API_KEY (or OPENAI_API_KEY) and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card">
      <h2>AI Assistant</h2>
      <p className="muted">Ask questions about my resume, projects, and technical strengths.</p>

      <div className="chat-box" aria-live="polite">
        {messages.map((message, idx) => (
          <div
            key={`${message.role}-${idx}`}
            className={`msg ${message.role === 'user' ? 'msg-user' : 'msg-assistant'}`}
          >
            <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong> {message.content}
          </div>
        ))}
        {loading ? <div className="msg msg-assistant">Assistant is typing…</div> : null}
      </div>

      <form onSubmit={onSubmit} className="chat-form">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="e.g., What projects show your React skills?"
          aria-label="Ask portfolio assistant"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </section>
  );
}