import { useState } from 'react';
import { type CoreMessage } from 'ai';
import { chatPdfService } from '@/service/chatService';

export function useCustomChat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: CoreMessage = {
      role: 'user',
      content: input
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();

      // Thêm message assistant trống vào messages
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: ''
        }
      ]);

      // Xử lý stream text
      const stream = chatPdfService([...messages, userMessage], controller.signal);

      let content = '';

      for await (const chunk of stream.textStream) {
        content += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          lastMessage.content = content;
          return newMessages;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error
  };
}
