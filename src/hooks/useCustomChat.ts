import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { chatPdfService } from '@/src/service/chatService';
import { chatHistoryStore } from '@/src/lib/database/chatHistoryDB';
import { UIMessage } from '../types/messages';

export function useCustomChat(chatId: string) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load chat history when component mounts
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const history = await chatHistoryStore.getChatHistory(chatId);
        if (history) {
          // Convert ChatMessage[] to CoreMessage[]
          setMessages(history.messages as UIMessage[]);
          setNotFound(false);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
        setNotFound(true);
      }
    };

    loadChatHistory();
  }, [chatId]);

  // Save messages to chat history whenever they change
  useEffect(() => {
    const saveChatHistory = async () => {
      try {
        // Filter out system messages and convert CoreMessage[] to ChatMessage[]
        const chatMessages = messages.filter(
          (msg): msg is UIMessage => msg.role === 'user' || msg.role === 'assistant'
        );

        await chatHistoryStore.saveChatHistory({
          id: chatId,
          messages: chatMessages,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (err) {
        console.error('Error saving chat history:', err);
      }
    };

    if (messages.length > 0) {
      saveChatHistory();
    }
  }, [messages, chatId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: UIMessage = {
      id: nanoid(),
      role: 'user',
      parts: [{ type: 'text', text: input }]
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
          id: nanoid(),
          role: 'assistant',
          parts: [{ type: 'text', text: '' }]
        }
      ]);

      // Xử lý stream text
      const modelMessages = [...messages, userMessage].map((msg) => {
        const content = msg.parts
          .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
          .map((part) => part.text)
          .join('');
        return {
          role: msg.role as 'user' | 'assistant',
          content
        };
      });

      const stream = chatPdfService(modelMessages, controller.signal, chatId);

      let content = '';

      for await (const chunk of stream.textStream) {
        content += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            const textPart = lastMessage.parts.find(
              (part) => part.type === 'text'
            );
            if (textPart && 'text' in textPart) {
              textPart.text = content;
            } else {
              lastMessage.parts.push({ type: 'text', text: content });
            }
          }
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
    error,
    notFound
  };
}
