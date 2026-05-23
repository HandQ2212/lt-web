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

export type ChatbotTaskStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface ChatbotTaskAcceptedResponse {
  taskId: string;
  status: ChatbotTaskStatus;
  pollAfterMs: number;
  submittedAt: string;
}

export interface ChatbotTaskStatusResponse {
  taskId: string;
  status: ChatbotTaskStatus;
  message?: string;
  source?: 'OPENAI' | 'LOCAL_FALLBACK';
  error?: string;
  submittedAt: string;
  completedAt?: string;
  timestamp?: string;
}

export const chatbotApi = {
  submitMessage: async (payload: {
    message: string;
    history: ChatbotHistoryMessage[];
    currentPath?: string;
  }) => {
    const response = await api.post<ChatbotTaskAcceptedResponse>('public/chatbot/messages', payload);
    return response.data;
  },
  getTaskStatus: async (taskId: string) => {
    const response = await api.get<ChatbotTaskStatusResponse>(`public/chatbot/tasks/${taskId}`);
    return response.data;
  },
};
