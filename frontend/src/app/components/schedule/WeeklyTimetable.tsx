import { useEffect, useMemo, useState } from 'react';
import { Box, Button, ButtonGroup, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { formatDateToDDMMYYYY } from '../../utils/dateFormatter';
import { dayOfWeekIndexMap, getWeekDates, timeToMinutes, toIsoDate } from '../../utils/timetable';

export type WeeklyTimetableSession = {
  key: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  title: string;
  subtitle?: string;
  roomLabel?: string;
  teacherLabel?: string;
  statusLabel?: string;
  dateLabel?: string;
};

type WeeklyTimetableProps = {
  sessions: WeeklyTimetableSession[];
  title?: string;
  emptyMessage?: string;
  referenceDate?: Date;
  onSessionClick?: (session: WeeklyTimetableSession) => void;
  onWeekChange?: (startIso: string, endIso: string) => void;
  showControls?: boolean;
};

const PERIOD_START_HOUR = 7;
const PERIOD_COUNT = 11;

export default function WeeklyTimetable({
  sessions,
  title = 'Thời khóa biểu tuần',
  emptyMessage = 'Chưa có lịch cho tuần này.',
  referenceDate,
  onSessionClick,
  onWeekChange,
  showControls = true,
}: WeeklyTimetableProps) {
  const [refDate, setRefDate] = useState<Date>(() => (referenceDate ? new Date(referenceDate) : new Date()));
  useEffect(() => {
    if (referenceDate) setRefDate(new Date(referenceDate));
  }, [referenceDate]);

  const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);

  const board = useMemo(() => {
    const cells: Record<string, { span: number; items: WeeklyTimetableSession[] }> = {};
    const coveredCells = new Set<string>();

    sessions.forEach((session) => {
      const dayIndex = dayOfWeekIndexMap[session.dayOfWeek.toUpperCase()];
      if (dayIndex === undefined) {
        return;
      }

      const startMinutes = timeToMinutes(session.startTime);
      const endMinutes = timeToMinutes(session.endTime);
      const startRow = Math.max(0, Math.min(PERIOD_COUNT - 1, Math.floor(startMinutes / 60) - PERIOD_START_HOUR));
      const span = Math.max(1, Math.min(PERIOD_COUNT - startRow, Math.ceil(Math.max(endMinutes - startMinutes, 60) / 60)));
      const cellKey = `${dayIndex}-${startRow}`;
      const existing = cells[cellKey];

      if (!existing) {
        cells[cellKey] = { span, items: [session] };
        for (let coveredRow = startRow + 1; coveredRow < startRow + span; coveredRow += 1) {
          coveredCells.add(`${dayIndex}-${coveredRow}`);
        }
        return;
      }

      existing.span = Math.max(existing.span, span);
      existing.items.push(session);
    });

    return { cells, coveredCells };
  }, [sessions]);

  useEffect(() => {
    if (onWeekChange) {
      const startIso = toIsoDate(weekDates[0]);
      const endIso = toIsoDate(weekDates[6]);
      onWeekChange(startIso, endIso);
    }
  }, [weekDates, onWeekChange]);

  const gotoPrevWeek = () => setRefDate((d) => new Date(d.getTime() - 7 * 24 * 3600 * 1000));
  const gotoNextWeek = () => setRefDate((d) => new Date(d.getTime() + 7 * 24 * 3600 * 1000));
  const gotoToday = () => setRefDate(new Date());

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: 'hidden',
        borderRadius: 3,
        borderColor: 'rgba(14, 165, 233, 0.28)',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: '1px solid rgba(14, 165, 233, 0.14)',
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(240,249,255,0.95))',
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={900} color="primary.main" sx={{ letterSpacing: 0.2 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Tuần {formatDateToDDMMYYYY(weekDates[0])} - {formatDateToDDMMYYYY(weekDates[6])}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {showControls && (
            <ButtonGroup variant="outlined" size="small" sx={{ mr: 1 }}>
              <IconButton size="small" onClick={gotoPrevWeek} aria-label="Tuần trước">
                <ChevronLeftIcon />
              </IconButton>
              <Button onClick={gotoToday} startIcon={<CalendarTodayIcon />} sx={{ fontWeight: 700 }}>
                Hôm nay
              </Button>
              <IconButton size="small" onClick={gotoNextWeek} aria-label="Tuần sau">
                <ChevronRightIcon />
              </IconButton>
            </ButtonGroup>
          )}
          <Chip
            label={`Từ ${formatDateToDDMMYYYY(weekDates[0])} đến ${formatDateToDDMMYYYY(weekDates[6])}`}
            variant="outlined"
            sx={{ fontWeight: 700, borderColor: 'rgba(14,165,233,0.18)', color: 'primary.main' }}
          />
        </Box>
      </Box>

      {sessions.length === 0 ? (
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader size="small" sx={{ minWidth: 1100, tableLayout: 'fixed' }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: 72,
                    bgcolor: 'primary.main',
                    color: '#fff',
                    fontWeight: 900,
                    textAlign: 'center',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                />
                {weekDates.map((date, index) => (
                  <TableCell
                    key={date.toISOString()}
                    sx={{
                      width: `${100 / 7}%`,
                      textAlign: 'center',
                      fontWeight: 800,
                      py: 1.5,
                      bgcolor: index === 0 ? 'rgba(14,165,233,0.04)' : '#fff',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                      {index === 6 ? 'Chủ Nhật' : `Thứ ${index + 2}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                      {formatDateToDDMMYYYY(date).slice(0, 5)}
                    </Typography>
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    width: 78,
                    bgcolor: 'primary.main',
                    color: '#fff',
                    fontWeight: 900,
                    textAlign: 'center',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: PERIOD_COUNT }, (_, periodIndex) => {
                const startHour = PERIOD_START_HOUR + periodIndex;
                return (
                  <TableRow key={startHour} hover>
                    <TableCell
                      sx={{
                        bgcolor: 'primary.main',
                        color: '#fff',
                        fontWeight: 800,
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        borderColor: 'rgba(255,255,255,0.08)',
                      }}
                    >
                      Tiết {periodIndex + 1}
                    </TableCell>

                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const cellKey = `${dayIndex}-${periodIndex}`;
                      if (board.coveredCells.has(cellKey)) {
                        return null;
                      }

                      const cell = board.cells[cellKey];

                      if (!cell) {
                        return (
                          <TableCell
                            key={cellKey}
                            sx={{
                              height: 86,
                              verticalAlign: 'top',
                              bgcolor: periodIndex % 2 === 0 ? '#fff' : 'rgba(248, 250, 252, 0.8)',
                            }}
                          />
                        );
                      }

                      return (
                        <TableCell
                          key={cellKey}
                          rowSpan={cell.span}
                          sx={{
                            p: 0.75,
                            verticalAlign: 'top',
                            bgcolor: 'rgba(219, 234, 254, 0.9)',
                            borderColor: 'rgba(59, 130, 246, 0.22)',
                          }}
                        >
                          <Box
                            sx={{
                              minHeight: cell.span * 86 - 12,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.75,
                              p: 1,
                              borderRadius: 2,
                              background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(219,234,254,0.85))',
                              border: '1px solid rgba(59, 130, 246, 0.22)',
                              boxShadow: '0 8px 22px rgba(59, 130, 246, 0.08)',
                              overflow: 'hidden',
                            }}
                          >
                            {cell.items.map((item) => (
                              <Box
                                key={item.key}
                                role={onSessionClick ? 'button' : undefined}
                                tabIndex={onSessionClick ? 0 : undefined}
                                onClick={onSessionClick ? () => onSessionClick(item) : undefined}
                                onKeyDown={
                                  onSessionClick
                                    ? (event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                          event.preventDefault();
                                          onSessionClick(item);
                                        }
                                      }
                                    : undefined
                                }
                                sx={{
                                  p: 1,
                                  borderRadius: 1.5,
                                  bgcolor: 'rgba(191, 219, 254, 0.8)',
                                  border: '1px solid rgba(37, 99, 235, 0.18)',
                                  cursor: onSessionClick ? 'pointer' : 'default',
                                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                                  '&:hover': onSessionClick
                                    ? {
                                        transform: 'translateY(-1px)',
                                        borderColor: 'rgba(37, 99, 235, 0.35)',
                                        boxShadow: '0 10px 24px rgba(37, 99, 235, 0.12)',
                                      }
                                    : undefined,
                                  '&:focus-visible': onSessionClick
                                    ? {
                                        outline: '2px solid rgba(37, 99, 235, 0.55)',
                                        outlineOffset: 2,
                                      }
                                    : undefined,
                                }}
                              >
                                <Typography variant="body2" fontWeight={900} sx={{ lineHeight: 1.25, mb: 0.25 }}>
                                  {item.title}
                                </Typography>
                                {item.subtitle && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                                    {item.subtitle}
                                  </Typography>
                                )}
                                {item.teacherLabel && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    GV: {item.teacherLabel}
                                  </Typography>
                                )}
                                {item.roomLabel && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                    Phòng: {item.roomLabel}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {item.dateLabel ? `${item.dateLabel} • ` : ''}{item.startTime} - {item.endTime}
                                </Typography>
                                {item.statusLabel && (
                                  <Chip
                                    size="small"
                                    label={item.statusLabel}
                                    variant="outlined"
                                    sx={{ mt: 0.75, height: 22, fontSize: 11, fontWeight: 800 }}
                                  />
                                )}
                              </Box>
                            ))}
                          </Box>
                        </TableCell>
                      );
                    })}

                    <TableCell
                      sx={{
                        bgcolor: 'primary.main',
                        color: '#fff',
                        fontWeight: 900,
                        textAlign: 'center',
                        borderColor: 'rgba(255,255,255,0.08)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {String(startHour).padStart(2, '0')}:00
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}