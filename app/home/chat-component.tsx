// app/home/chat-component.tsx
'use client';

import { useStreamChat } from '@/app/hooks/use-stream-chat';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

export default function ChatComponent() {
  const { messages, sendMessage, isLoading } = useStreamChat();
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-2xl mx-auto my-8 border rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
                <div className="p-2 rounded-lg bg-gray-200 animate-pulse">
                    Thinking...
                </div>
            </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          className="w-full p-2 border rounded-md"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything..."
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
