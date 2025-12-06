// app/hooks/use-stream-chat.ts
import { useState } from 'react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function useStreamChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (messageContent: string) => {
    setIsLoading(true);

    const newMessages: Message[] = [
        ...messages,
        { role: 'user', content: messageContent },
    ];
    setMessages(newMessages);

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
    });

    if (!response.body) {
        setIsLoading(false);
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let modelResponse = '';

    setMessages([...newMessages, { role: 'model', content: '' }]);

    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            break;
        }

        const chunk = decoder.decode(value, { stream: true });
        modelResponse += chunk;

        setMessages([
            ...newMessages,
            { role: 'model', content: modelResponse },
        ]);
    }

    setIsLoading(false);
  };

  return { messages, sendMessage, isLoading };
}
