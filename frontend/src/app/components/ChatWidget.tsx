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
const CHATBOT_POLL_INTERVAL_MS = 3000;
const CHATBOT_POLL_TIMEOUT_MS = 90000;

const getDisplayName = (user: any) => user?.name || user?.fullName || '';

const createWelcomeMessage = (displayName: string): ChatMessage => ({
  id: 'welcome',
  text: `Xin chao${displayName ? ` ${displayName}` : ''}! Toi la tro ly ELC. Ban can tu van khoa hoc, lich hoc hay hoc phi?`,
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
  const isMountedRef = useRef(true);

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

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const pollChatbotTask = async (taskId: string, pollAfterMs?: number) => {
    const startedAt = Date.now();
    const intervalMs = Math.max(pollAfterMs ?? CHATBOT_POLL_INTERVAL_MS, 1000);

    while (Date.now() - startedAt < CHATBOT_POLL_TIMEOUT_MS) {
      await new Promise((resolve) => window.setTimeout(resolve, intervalMs));

      const status = await chatbotApi.getTaskStatus(taskId);
      if (status.status === 'SUCCESS' && status.message) {
        return {
          message: status.message,
          source: status.source || 'LOCAL_FALLBACK',
          timestamp: status.timestamp || new Date().toISOString(),
        };
      }

      if (status.status === 'FAILED') {
        throw new Error(status.error || 'Khong the xu ly yeu cau luc nay.');
      }
    }

    throw new Error('Tro ly ELC dang xu ly cham hon du kien. Vui long thu lai sau it phut.');
  };

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
      const accepted = await chatbotApi.submitMessage({
        message: trimmedText,
        history,
        currentPath: window.location.pathname,
      });

      const response = await pollChatbotTask(accepted.taskId, accepted.pollAfterMs);
      if (!isMountedRef.current) {
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-bot`,
          text: response.message,
          sender: 'bot',
          timestamp: new Date(response.timestamp || Date.now()),
        },
      ]);
    } catch (error: any) {
      if (!isMountedRef.current) {
        return;
      }

      setErrorText(error?.message || 'Chua ket noi duoc voi tro ly ELC. Vui long thu lai sau it phut.');
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: 'Xin loi, tro ly ELC dang tam thoi chua phan hoi duoc. Ban co the thu lai hoac gui form lien he.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      if (isMountedRef.current) {
        setIsSending(false);
      }
    }
  };

  const subtitle = isSending ? 'Dang tra loi...' : user ? 'Ho tro theo tai khoan' : 'Tu van khoa hoc';

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
                <Typography variant="subtitle1" fontWeight={700}>Tro ly ELC</Typography>
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
                placeholder="Nhap tin nhan..."
                value={inputText}
                disabled={isSending}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
                multiline
                maxRows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <IconButton
                color="primary"
                disabled={!inputText.trim() || isSending}
                onClick={() => void handleSend()}
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
