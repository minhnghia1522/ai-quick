// src/types/messages.ts

export type MessagePart =
  | { type: 'text'; text: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: string; [key: string]: any }; // mở rộng cho tool, data, v.v.

export interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | string;
  parts: MessagePart[];
  createdAt?: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  tool?: string; // hoặc có thể mở rộng cho tool invocation
}