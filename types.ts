export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isStreaming?: boolean;
  isError?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}