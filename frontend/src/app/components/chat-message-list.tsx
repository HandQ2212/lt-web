import { RefObject } from 'react';
import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';
import { Person as PersonIcon, SmartToy as BotIcon } from '@mui/icons-material';
import ChatMessageContent from './chat-message-content';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatMessageListProps {
  messages: ChatMessage[];
  isSending: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
}

function TypingIndicator() {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-end">
      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', color: 'primary.dark' }}>
        <BotIcon sx={{ fontSize: 17 }} />
      </Avatar>
      <Paper
        elevation={0}
        sx={{
          px: 1.5,
          py: 1.25,
          borderRadius: 2.5,
          borderTopLeftRadius: 0.75,
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          {[0, 1, 2].map((dot) => (
            <Box
              key={dot}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                opacity: 0.35,
                animation: 'typingPulse 1.2s ease-in-out infinite',
                animationDelay: `${dot * 0.18}s`,
                '@keyframes typingPulse': {
                  '0%, 80%, 100%': { opacity: 0.35, transform: 'translateY(0)' },
                  '40%': { opacity: 1, transform: 'translateY(-3px)' },
                },
              }}
            />
          ))}
          <Typography variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
            Đang soạn
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}

function MessageRow({ msg }: { msg: ChatMessage }) {
  const isUser = msg.sender === 'user';

  return (
    <Stack direction="row" spacing={1} alignItems="flex-end" justifyContent={isUser ? 'flex-end' : 'flex-start'} sx={{ width: '100%' }}>
      {!isUser && (
        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.light', color: 'primary.dark' }}>
          <BotIcon sx={{ fontSize: 17 }} />
        </Avatar>
      )}
      <Box sx={{ maxWidth: { xs: '82%', sm: '76%' }, minWidth: 0 }}>
        <Paper
          elevation={0}
          sx={{
            px: 1.75,
            py: 1.35,
            borderRadius: 2.5,
            bgcolor: isUser ? 'primary.main' : 'white',
            border: isUser ? 'none' : '1px solid',
            borderColor: 'divider',
            boxShadow: isUser ? '0 8px 18px rgba(25, 118, 210, 0.2)' : '0 6px 18px rgba(15, 23, 42, 0.06)',
            borderTopRightRadius: isUser ? 0.75 : 2.5,
            borderTopLeftRadius: isUser ? 2.5 : 0.75,
          }}
        >
          <ChatMessageContent text={msg.text} isUser={isUser} />
        </Paper>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5, display: 'block', textAlign: isUser ? 'right' : 'left', px: 0.5 }}
        >
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>
      {isUser && (
        <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.dark', color: 'white' }}>
          <PersonIcon sx={{ fontSize: 16 }} />
        </Avatar>
      )}
    </Stack>
  );
}

export default function ChatMessageList({ messages, isSending, messagesEndRef }: ChatMessageListProps) {
  return (
    <Stack spacing={1.75}>
      {messages.map((msg) => (
        <MessageRow key={msg.id} msg={msg} />
      ))}
      {isSending && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </Stack>
  );
}
