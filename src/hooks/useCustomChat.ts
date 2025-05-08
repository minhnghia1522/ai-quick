import { useState, useEffect } from 'react';
import { type CoreMessage } from 'ai';
import { chatPdfService } from '@/src/service/chatService';
import { chatHistoryStore, type ChatMessage } from '@/src/lib/database/chatHistoryDB';

export function useCustomChat(chatId: string) {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
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
          setMessages(history.messages as CoreMessage[]);
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
          (msg): msg is ChatMessage => msg.role === 'user' || msg.role === 'assistant'
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
      const stream = chatPdfService([...messages, userMessage], controller.signal, chatId);

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
    error,
    notFound
  };
}
