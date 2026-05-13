import api from './api';

export type ChatbotHistoryRole = 'user' | 'assistant';

export interface ChatbotHistoryMessage {
  role: ChatbotHistoryRole;
  content: string;
}

export interface ChatbotReply {
  message: string;
  source: 'OPENAI' | 'LOCAL_FALLBACK';
  timestamp: string;
}

export const chatbotApi = {
  sendMessage: async (payload: {
    message: string;
    history: ChatbotHistoryMessage[];
    currentPath?: string;
  }) => {
    const response = await api.post<ChatbotReply>('public/chatbot/messages', payload);
    return response.data;
  },
};
