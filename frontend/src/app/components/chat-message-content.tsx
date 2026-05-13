import { Box, Link, Stack, Typography } from '@mui/material';

type MarkdownBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'code'; content: string };

const isBulletLine = (line: string) => /^[-*]\s+/.test(line.trim());
const isNumberedLine = (line: string) => /^\d+\.\s+/.test(line.trim());

const parseBlocks = (text: string): MarkdownBlock[] => {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const trimmed = lines[index].trim();
    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: 'code', content: codeLines.join('\n') });
      index += 1;
      continue;
    }

    if (isBulletLine(lines[index])) {
      const items: string[] = [];
      while (index < lines.length && isBulletLine(lines[index])) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'unordered-list', items });
      continue;
    }

    if (isNumberedLine(lines[index])) {
      const items: string[] = [];
      while (index < lines.length && isNumberedLine(lines[index])) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'ordered-list', items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length
      && lines[index].trim()
      && !lines[index].trim().startsWith('```')
      && !isBulletLine(lines[index])
      && !isNumberedLine(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: 'paragraph', content: paragraphLines.join('\n') });
  }

  return blocks;
};

const safeHref = (href: string) => (
  /^(https?:\/\/|mailto:|tel:)/i.test(href.trim()) ? href.trim() : undefined
);

const renderInlineMarkdown = (text: string, color: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Box key={index} component="strong" sx={{ fontWeight: 700 }}>{part.slice(2, -2)}</Box>;
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <Box
          key={index}
          component="code"
          sx={{
            px: 0.6,
            py: 0.15,
            borderRadius: 1,
            bgcolor: 'rgba(15, 23, 42, 0.08)',
            color,
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.86em',
          }}
        >
          {part.slice(1, -1)}
        </Box>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const href = safeHref(linkMatch[2]);
      return href ? (
        <Link key={index} href={href} target="_blank" rel="noreferrer" underline="hover" sx={{ fontWeight: 600 }}>
          {linkMatch[1]}
        </Link>
      ) : linkMatch[1];
    }

    return part;
  });
};

interface ChatMessageContentProps {
  text: string;
  isUser: boolean;
}

export default function ChatMessageContent({ text, isUser }: ChatMessageContentProps) {
  const textColor = isUser ? 'white' : 'text.primary';

  return (
    <Stack spacing={1}>
      {parseBlocks(text).map((block, index) => {
        if (block.type === 'code') {
          return (
            <Box
              key={index}
              component="pre"
              sx={{
                m: 0,
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: isUser ? 'rgba(255,255,255,0.14)' : '#0f172a',
                color: isUser ? 'white' : '#e2e8f0',
                overflowX: 'auto',
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.78rem',
                lineHeight: 1.6,
              }}
            >
              <code>{block.content}</code>
            </Box>
          );
        }

        if (block.type === 'unordered-list' || block.type === 'ordered-list') {
          return (
            <Box
              key={index}
              component={block.type === 'ordered-list' ? 'ol' : 'ul'}
              sx={{
                m: 0,
                pl: 2.5,
                color: textColor,
                '& li': { pl: 0.25, mb: 0.5, lineHeight: 1.65 },
                '& li:last-child': { mb: 0 },
              }}
            >
              {block.items.map((item, itemIndex) => (
                <Typography key={itemIndex} component="li" variant="body2" sx={{ color: textColor }}>
                  {renderInlineMarkdown(item, textColor)}
                </Typography>
              ))}
            </Box>
          );
        }

        return (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: textColor, lineHeight: 1.7, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
          >
            {renderInlineMarkdown(block.content, textColor)}
          </Typography>
        );
      })}
    </Stack>
  );
}
