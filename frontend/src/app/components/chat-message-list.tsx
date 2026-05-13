import { RefObject } from 'react';
import { Box, CircularProgress, Paper, Stack, Typography } from '@mui/material';

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

export default function ChatMessageList({ messages, isSending, messagesEndRef }: ChatMessageListProps) {
  return (
    <Stack spacing={2}>
      {messages.map((msg) => (
        <Box
          key={msg.id}
          sx={{
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
          }}
        >
          <Paper
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
              color: msg.sender === 'user' ? 'white' : 'text.primary',
              boxShadow: 1,
              borderTopRightRadius: msg.sender === 'user' ? 0 : 3,
              borderTopLeftRadius: msg.sender === 'user' ? 3 : 0,
            }}
          >
            <Typography variant="body2">{msg.text}</Typography>
          </Paper>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 0.5, display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left' }}
          >
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      ))}
      {isSending && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <CircularProgress size={16} />
          <Typography variant="caption">Trợ lý đang soạn trả lời</Typography>
        </Box>
      )}
      <div ref={messagesEndRef} />
    </Stack>
  );
}
