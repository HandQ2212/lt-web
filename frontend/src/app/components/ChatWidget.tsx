import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Paper,
  Typography,
  IconButton,
  TextField,
  Avatar,
  Fade,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { chatbotApi, ChatbotHistoryMessage } from '../../services/chatbot-api';
import ChatMessageList, { ChatMessage } from './chat-message-list';

const STORAGE_PREFIX = 'elc-chatbot-history';
const MAX_STORED_MESSAGES = 30;

const getDisplayName = (user: any) => user?.name || user?.fullName || '';

const createWelcomeMessage = (displayName: string): ChatMessage => ({
  id: 'welcome',
  text: `Xin chào${displayName ? ` ${displayName}` : ''}! Tôi là trợ lý ELC. Bạn cần tư vấn khóa học, lịch học hay học phí?`,
  sender: 'bot',
  timestamp: new Date(),
});

const loadMessages = (storageKey: string, welcomeMessage: ChatMessage): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [welcomeMessage];

    const parsed = JSON.parse(stored) as Array<Omit<ChatMessage, 'timestamp'> & { timestamp: string }>;
    const messages = parsed
      .filter((message) => message.id && message.text && message.sender)
      .map((message) => ({ ...message, timestamp: new Date(message.timestamp) }))
      .slice(-MAX_STORED_MESSAGES);

    return messages.length ? messages : [welcomeMessage];
  } catch {
    return [welcomeMessage];
  }
};

export default function ChatWidget() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const displayName = getDisplayName(user);
  const storageKey = `${STORAGE_PREFIX}:${user?.id || 'guest'}`;
  const [messages, setMessages] = useState<ChatMessage[]>(() => [createWelcomeMessage(displayName)]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages(loadMessages(storageKey, createWelcomeMessage(displayName)));
  }, [storageKey, displayName]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_STORED_MESSAGES)));
  }, [messages, storageKey]);

  const handleSend = async () => {
    const trimmedText = inputText.trim();
    if (!trimmedText || isSending) return;

    const history: ChatbotHistoryMessage[] = messages.slice(-8).map((message) => ({
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: message.text,
    }));

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      text: trimmedText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsSending(true);
    setErrorText('');

    try {
      const response = await chatbotApi.sendMessage({
        message: trimmedText,
        history,
        currentPath: window.location.pathname,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          text: response.message,
          sender: 'bot',
          timestamp: new Date(response.timestamp || Date.now()),
        },
      ]);
    } catch {
      setErrorText('Chưa kết nối được với trợ lý ELC. Vui lòng thử lại sau ít phút.');
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: 'Xin lỗi, trợ lý ELC đang tạm thời chưa phản hồi được. Bạn có thể thử lại hoặc gửi form liên hệ.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const subtitle = isSending ? 'Đang trả lời...' : user ? 'Hỗ trợ theo tài khoản' : 'Tư vấn khóa học';

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        sx={{
          position: 'fixed',
          bottom: { xs: 20, sm: 30 },
          right: { xs: 20, sm: 30 },
          zIndex: 1000,
          border: '2px solid #1E293B',
          boxShadow: '5px 5px 0 #1E293B',
          '&:hover': {
            bgcolor: 'secondary.main',
            transform: 'translate(-2px, -2px)',
            boxShadow: '7px 7px 0 #1E293B',
          },
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      <Fade in={isOpen}>
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: { xs: 84, sm: 100 },
            right: { xs: 16, sm: 30 },
            width: { xs: 'calc(100vw - 32px)', sm: 380 },
            height: { xs: 480, sm: 520 },
            zIndex: 1000,
            borderRadius: 4,
            border: '2px solid #1E293B',
            boxShadow: '8px 8px 0 #1E293B',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderBottom: '2px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 1 }}>
                <BotIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Trợ lý ELC</Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>{subtitle}</Typography>
              </Box>
            </Box>
            <IconButton size="small" color="inherit" onClick={() => setIsOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              bgcolor: '#FFFDF5',
              backgroundImage: 'radial-gradient(circle, rgba(30,41,59,0.12) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          >
            <ChatMessageList messages={messages} isSending={isSending} messagesEndRef={messagesEndRef} />
          </Box>

          <Divider />

          <Box sx={{ p: 2, bgcolor: 'white', borderTop: '2px solid #1E293B' }}>
            {errorText && (
              <Alert severity="warning" variant="outlined" sx={{ mb: 1.25, py: 0.25, borderRadius: 2 }}>
                {errorText}
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Nhập tin nhắn..."
                value={inputText}
                disabled={isSending}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                multiline
                maxRows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <IconButton
                color="primary"
                disabled={!inputText.trim() || isSending}
                onClick={handleSend}
                sx={{ border: '2px solid #1E293B', bgcolor: '#FBBF24', boxShadow: '3px 3px 0 #1E293B' }}
              >
                {isSending ? <CircularProgress size={22} /> : <SendIcon />}
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}
