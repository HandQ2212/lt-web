import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { courseApi, levelApi, classApi, enrollmentApi, attendanceApi } from '../../../services/api';
import { formatDateToDDMMYYYY, formatTimeToHHMM } from '../../utils/dateFormatter';
import { dayOfWeekIndexMap, dayOfWeekLabelMap } from '../../utils/timetable';

interface ProgramLevel {
  id: string;
  code: string;
  name: string;
  basePrice: number;
  durationWeeks: number | null;
}

interface Clazz {
  id: string;
  name: string;
  status: string;
  teacherName?: string;
  schedule?: any[];
}

interface ClassDetail extends Clazz {
  courseName?: string;
  roomName?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  currentStudents?: number;
  schedules?: Array<{ id?: string; dayOfWeek: string; startTime: string; endTime: string }>;
}

interface EnrollmentItem {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  enrollmentDate?: string;
  status?: string;
}

interface AttendanceItem {
  id: string;
  enrollmentId: string;
  studentName: string;
  attendanceDate: string;
  status: string;
  notes?: string;
}

interface ScheduleForm {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const defaultScheduleForm: ScheduleForm = {
  dayOfWeek: 'MONDAY',
  startTime: '18:00',
  endTime: '20:00',
};

interface Program {
  id: string;
  name: string;
  description: string;
  levels: ProgramLevel[];
}

interface LevelItem {
  id: string;
  courseId: string | null;
  courseName: string;
  code: string;
  name: string;
  description: string;
  displayOrder: number | null;
  basePrice: number;
  durationWeeks: number | null;
  isActive: boolean;
  classes?: Clazz[];
}

interface ProgramForm {
  name: string;
  description: string;
}

interface LevelForm {
  courseId: string;
  code: string;
  name: string;
  description: string;
  basePrice: number | string;
  durationWeeks: number | string;
  isActive: boolean;
}

const defaultProgramForm: ProgramForm = {
  name: '',
  description: '',
};


const formatSessionDateLabel = (date: Date) => {
  const raw = date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const defaultLevelForm: LevelForm = {
  courseId: '',
  code: '',
  name: '',
  description: '',
  basePrice: '',
  durationWeeks: '',
  isActive: true,
};

type ScheduleSessionRow = {
  key: string;
  sortTime: number;
  dateLabel: string;
  timeLabel: string;
  roomLabel: string;
  formatLabel: string;
  attendanceLabel: string;
  teacherLabel: string;
  titleLabel: string;
  materialLabel: string;
  scheduleId?: string;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
};

const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'Chờ khai giảng';
      case 'ACCEPTING':
        return 'Đang tuyển sinh';
      case 'ONGOING':
        return 'Đang diễn ra';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
    }
  };


export default function ProgramManagementPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [filteredLevels, setFilteredLevels] = useState<LevelItem[]>([]);
  const [programSearchQuery, setProgramSearchQuery] = useState('');
  const [levelSearchQuery, setLevelSearchQuery] = useState('');
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openProgramDialog, setOpenProgramDialog] = useState(false);
  const [openLevelDialog, setOpenLevelDialog] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedLevelId, setExpandedLevelId] = useState<string | null>(null);
  const [levelFormSourceType, setLevelFormSourceType] = useState<'program' | 'tab'>('tab');
  const [programForm, setProgramForm] = useState<ProgramForm>(defaultProgramForm);
  const [levelForm, setLevelForm] = useState<LevelForm>(defaultLevelForm);
  const [selectedClass, setSelectedClass] = useState<Clazz | null>(null);
  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassDetail | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [classAttendance, setClassAttendance] = useState<AttendanceItem[]>([]);
  const [loadingClassDetails, setLoadingClassDetails] = useState(false);
  const [detailTab, setDetailTab] = useState(0);
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>(defaultScheduleForm);
  const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; classId: string; scheduleId?: string }>({
    open: false,
    classId: '',
  });
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<'create' | 'edit'>('create');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const todayIso = new Date().toISOString().slice(0, 10);
  const dayOfWeekIndexMap: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

  useEffect(() => {
    void fetchPrograms();
    void fetchLevels();
  }, []);

  useEffect(() => {
    const query = programSearchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredPrograms(programs);
      return;
    }

    setFilteredPrograms(
      programs.filter(
        (program) =>
          program.name.toLowerCase().includes(query) ||
          program.description.toLowerCase().includes(query) ||
          program.levels.some((level) => level.code.toLowerCase().includes(query) || level.name.toLowerCase().includes(query))
      )
    );
  }, [programs, programSearchQuery]);

  useEffect(() => {
    const query = levelSearchQuery.trim().toLowerCase();
    if (!query) {
      setFilteredLevels(levels);
      return;
    }

    setFilteredLevels(
      levels.filter(
        (level) =>
          level.code.toLowerCase().includes(query) ||
          level.name.toLowerCase().includes(query) ||
          level.courseName.toLowerCase().includes(query)
      )
    );
  }, [levels, levelSearchQuery]);

  const fetchPrograms = async () => {
    setLoadingPrograms(true);
    try {
      const data = await courseApi.getAll();
      setPrograms(
        (Array.isArray(data) ? data : []).map((course: any) => ({
          id: course.id,
          name: course.name,
          description: course.description,
          levels: Array.isArray(course.levels)
            ? course.levels.map((level: any) => ({
                id: level.id,
                code: level.code,
                name: level.name,
                basePrice: Number(level.basePrice || 0),
                durationWeeks: level.durationWeeks ?? null,
              }))
            : [],
        }))
      );
    } catch (error) {
      console.error('Failed to fetch programs', error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchLevels = async () => {
    setLoadingLevels(true);
    try {
      const [levelsData, classesData] = await Promise.all([
        levelApi.getAll(),
        classApi.getAll(),
      ]);
      
      const levelsWithClasses = levelsData.map((level: LevelItem) => ({
        ...level,
        classes: (classesData || []).filter((clazz: any) => clazz.levelId === level.id),
      }));
      
      setLevels(levelsWithClasses);
    } catch (error) {
      console.error('Failed to fetch levels', error);
    } finally {
      setLoadingLevels(false);
    }
  };

  const handleOpenCreateProgram = () => {
    setEditingProgramId(null);
    setProgramForm(defaultProgramForm);
    setOpenProgramDialog(true);
  };

  const handleOpenEditProgram = (program: Program) => {
    setEditingProgramId(program.id);
    setProgramForm({
      name: program.name,
      description: program.description,
    });
    setOpenProgramDialog(true);
  };

  const handleSubmitProgram = async () => {
    if (!programForm.name.trim() || !programForm.description.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng điền tên và mô tả chương trình',
        severity: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      if (editingProgramId) {
        await courseApi.update(editingProgramId, programForm);
        setSnackbar({ open: true, message: 'Cập nhật chương trình thành công', severity: 'success' });
      } else {
        await courseApi.create(programForm);
        setSnackbar({ open: true, message: 'Tạo chương trình thành công', severity: 'success' });
      }

      setOpenProgramDialog(false);
      setProgramForm(defaultProgramForm);
      void fetchPrograms();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || 'Thao tác thất bại',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCreateLevel = (courseId = '') => {
    setEditingLevelId(null);
    setLevelForm({
      ...defaultLevelForm,
      courseId,
    });
    setLevelFormSourceType(courseId ? 'program' : 'tab');
    setOpenLevelDialog(true);
    setActiveTab(1);
  };

  const handleOpenEditLevel = (level: LevelItem) => {
    setEditingLevelId(level.id);
    setLevelForm({
      courseId: level.courseId || '',
      code: level.code,
      name: level.name,
      description: level.description,
      basePrice: level.basePrice,
      durationWeeks: level.durationWeeks ?? '',
      isActive: level.isActive,
    });
    setLevelFormSourceType('tab');
    setOpenLevelDialog(true);
    setActiveTab(1);
  };

  const handleSubmitLevel = async () => {
    if (!levelForm.courseId || !levelForm.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng chọn chương trình và nhập tên mức độ',
        severity: 'error',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        courseId: levelForm.courseId,
        name: levelForm.name.trim(),
        description: levelForm.description.trim() || null,
        basePrice: levelForm.basePrice === '' ? null : Number(levelForm.basePrice),
        durationWeeks: levelForm.durationWeeks === '' ? null : Number(levelForm.durationWeeks),
        isActive: levelForm.isActive,
      };

      if (editingLevelId) {
        await levelApi.update(editingLevelId, payload);
        setSnackbar({ open: true, message: 'Cập nhật mức độ thành công', severity: 'success' });
      } else {
        await levelApi.create(payload);
        setSnackbar({ open: true, message: 'Tạo mức độ thành công', severity: 'success' });
      }

      setOpenLevelDialog(false);
      setLevelForm(defaultLevelForm);
      void fetchLevels();
      void fetchPrograms();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.message || 'Thao tác thất bại',
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương trình này?')) return;
    try {
      await courseApi.delete(id);
      setSnackbar({ open: true, message: 'Xóa chương trình thành công', severity: 'success' });
      void fetchPrograms();
      void fetchLevels();
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi xóa chương trình', severity: 'error' });
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mức độ này?')) return;
    try {
      await levelApi.delete(id);
      setSnackbar({ open: true, message: 'Xóa mức độ thành công', severity: 'success' });
      void fetchLevels();
      void fetchPrograms();
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi xóa mức độ', severity: 'error' });
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleOpenClassDetails = async (clazz: Clazz) => {
    setSelectedClass(clazz);
    setSelectedClassDetail(null);
    setEnrollments([]);
    setClassAttendance([]);
    setLoadingClassDetails(true);
    setDetailTab(0);
    try {
      const [classResponse, enrollmentResponse, attendanceResponse, scheduleResponse] = await Promise.all([
        classApi.getById(clazz.id),
        enrollmentApi.getByClass(clazz.id),
        attendanceApi.getByClass(clazz.id, todayIso),
        classApi.getSchedule(clazz.id),
      ]);

      const classData = classResponse?.data || {};
      const scheduleData = Array.isArray(scheduleResponse?.data)
        ? scheduleResponse.data
        : Array.isArray((classData as any)?.schedules)
          ? (classData as any).schedules
          : [];

      setSelectedClassDetail({
        ...clazz,
        ...classData,
        schedules: scheduleData,
      });
      setEnrollments(Array.isArray(enrollmentResponse?.data) ? enrollmentResponse.data : []);
      setClassAttendance(Array.isArray(attendanceResponse?.data) ? attendanceResponse.data : []);
    } catch (error) {
      console.error('Failed to fetch class enrollments', error);
      setSelectedClassDetail(clazz);
    } finally {
      setLoadingClassDetails(false);
    }
  };

  const handleCloseClassDetails = () => {
    setSelectedClass(null);
    setSelectedClassDetail(null);
    setEnrollments([]);
    setClassAttendance([]);
    setDetailTab(0);
    setScheduleForm(defaultScheduleForm);
  };

  const openScheduleDialog = (classId: string, schedule?: { id?: string; dayOfWeek: string; startTime: string; endTime: string }) => {
    setScheduleMode(schedule ? 'edit' : 'create');
    setScheduleDialog({ open: true, classId, scheduleId: schedule?.id });
    setScheduleForm(
      schedule
        ? {
            dayOfWeek: schedule.dayOfWeek,
            startTime: formatTimeToHHMM(schedule.startTime),
            endTime: formatTimeToHHMM(schedule.endTime),
          }
        : defaultScheduleForm
    );
  };

  const handleSaveSchedule = async () => {
    const targetClassId = selectedClassDetail?.id || selectedClass?.id;
    if (!targetClassId) {
      return;
    }

    try {
      setScheduleSubmitting(true);
      if (scheduleMode === 'edit' && scheduleDialog.scheduleId) {
        await classApi.updateSchedule(targetClassId, scheduleDialog.scheduleId, scheduleForm);
        setSnackbar({ open: true, message: 'Cập nhật lịch học thành công', severity: 'success' });
      } else {
        await classApi.addSchedule(targetClassId, scheduleForm);
        setSnackbar({ open: true, message: 'Thêm lịch học thành công', severity: 'success' });
      }
      setScheduleDialog({ open: false, classId: '' });
      setScheduleForm(defaultScheduleForm);
      void fetchLevels();
      void fetchPrograms();
      await handleOpenClassDetails({ id: targetClassId, name: selectedClassDetail?.name || selectedClass?.name || '', status: selectedClassDetail?.status || selectedClass?.status || '' });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể lưu lịch học',
        severity: 'error',
      });
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleDeleteSchedule = async (classIdOrScheduleId: string, scheduleIdMaybe?: string) => {
    try {
      const classId = scheduleIdMaybe ? classIdOrScheduleId : (selectedClassDetail?.id || selectedClass?.id || '');
      const scheduleId = scheduleIdMaybe || classIdOrScheduleId;
      if (!classId || !scheduleId) {
        return;
      }

      await classApi.deleteSchedule(classId, scheduleId);
      setSnackbar({ open: true, message: 'Xóa buổi học thành công', severity: 'success' });
      void fetchLevels();
      void fetchPrograms();
      const targetClassId = selectedClassDetail?.id || selectedClass?.id;
      if (targetClassId) {
        await handleOpenClassDetails({ id: targetClassId, name: selectedClassDetail?.name || selectedClass?.name || '', status: selectedClassDetail?.status || selectedClass?.status || '' });
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Không thể xóa buổi học',
        severity: 'error',
      });
    }
  };

  const handleOpenStudent = async (_enrollment: EnrollmentItem) => {
    return;
  };

  const selectedClassId = selectedClass?.id;

  const formatSessionDateLabel = (date: Date) => {
    const raw = date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const getStatusColor = (status?: string): 'default' | 'info' | 'success' | 'warning' | 'error' => {
    if (!status) return 'default';
    if (status === 'ACCEPTING') return 'success';
    if (status === 'FULL') return 'warning';
    if (status === 'ONGOING') return 'info';
    if (status === 'COMPLETED') return 'default';
    return 'default';
  };

  const getStatusLabel = (status?: string) => {
    if (!status) return 'Chưa rõ';
    if (status === 'ACCEPTING') return 'Đang tuyển';
    if (status === 'FULL') return 'Đầy';
    if (status === 'ONGOING') return 'Đang học';
    if (status === 'COMPLETED') return 'Hoàn thành';
    return status;
  };

  const activeClass = selectedClassDetail || (selectedClass as ClassDetail | null);
  const detailLoading = loadingClassDetails;
  const attendance = classAttendance;
  const scheduleSessionRows = useMemo<ScheduleSessionRow[]>(() => {
    if (!activeClass?.schedules?.length) {
      return [];
    }

    const rows: ScheduleSessionRow[] = [];

    const startDate = activeClass.startDate ? new Date(`${activeClass.startDate}T00:00:00`) : null;
    const endDate = activeClass.endDate ? new Date(`${activeClass.endDate}T23:59:59`) : null;

    const validRange = startDate && endDate && !Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && startDate <= endDate;

    if (validRange) {
      activeClass.schedules.forEach((schedule) => {
        const targetDay = dayOfWeekIndexMap[schedule.dayOfWeek.toUpperCase()];
        if (targetDay === undefined) {
          return;
        }

        const firstOccurrence = new Date(startDate as Date);
        const daysUntilFirstOccurrence = (targetDay - firstOccurrence.getDay() + 7) % 7;
        firstOccurrence.setDate(firstOccurrence.getDate() + daysUntilFirstOccurrence);

        for (let occurrence = new Date(firstOccurrence); occurrence <= (endDate as Date); occurrence.setDate(occurrence.getDate() + 7)) {
          const occurrenceDateKey = [
            occurrence.getFullYear(),
            String(occurrence.getMonth() + 1).padStart(2, '0'),
            String(occurrence.getDate()).padStart(2, '0'),
          ].join('-');

          rows.push({
            key: `${schedule.id || `${schedule.dayOfWeek}-${schedule.startTime}`}-${occurrenceDateKey}`,
            sortTime: occurrence.getTime(),
            dateLabel: formatSessionDateLabel(new Date(occurrence)),
            timeLabel: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
            roomLabel: activeClass.roomName || '-',
            formatLabel: activeClass.roomName ? 'Trực tiếp' : 'Online',
            attendanceLabel: 'Chưa điểm danh',
            teacherLabel: activeClass.teacherName || '-',
            titleLabel: activeClass.name || activeClass.courseName || '-',
            materialLabel: '-',
            scheduleId: schedule.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          });
        }
      });

      return rows.sort((left, right) => left.sortTime - right.sortTime);
    }

    activeClass.schedules.forEach((schedule) => {
      const labelDay = dayOfWeekLabelMap[schedule.dayOfWeek.toUpperCase()] || schedule.dayOfWeek;
      rows.push({
        key: schedule.id || `${schedule.dayOfWeek}-${schedule.startTime}`,
        sortTime: dayOfWeekIndexMap[schedule.dayOfWeek.toUpperCase()] || 0,
        dateLabel: labelDay,
        timeLabel: `${formatTimeToHHMM(schedule.startTime)} - ${formatTimeToHHMM(schedule.endTime)}`,
        roomLabel: activeClass.roomName || '-',
        formatLabel: activeClass.roomName ? 'Trực tiếp' : 'Online',
        attendanceLabel: 'Chưa điểm danh',
        teacherLabel: activeClass.teacherName || '-',
        titleLabel: activeClass.name || activeClass.courseName || '-',
        materialLabel: '-',
        scheduleId: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      });
    });

    return rows.sort((l, r) => l.sortTime - r.sortTime);
  }, [activeClass]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý Chương trình học
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateProgram}>
            Tạo chương trình
          </Button>
        </Stack>
      </Box>

      <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} sx={{ mb: 3 }}>
        <Tab label="Chương trình" />
        <Tab label="Mức độ" />
      </Tabs>

      {activeTab === 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm chương trình (tên, mô tả, mức độ...)"
              value={programSearchQuery}
              onChange={(e) => setProgramSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              variant="outlined"
              size="small"
            />
          </Box>

          {loadingPrograms ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredPrograms.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {programSearchQuery ? 'Không tìm thấy chương trình nào' : 'Chưa có chương trình nào'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredPrograms.map((program) => (
                <Grid xs={12} key={program.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => handleToggleExpand(program.id)}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton size="small" onClick={() => handleToggleExpand(program.id)}>
                              {expandedId === program.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            <Box>
                              <Typography variant="h6" fontWeight={700}>
                                {program.name}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                                <Chip label={`${program.levels.length} mức độ`} size="small" variant="outlined" color="primary" />
                              </Box>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleOpenEditProgram(program)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteProgram(program.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Collapse in={expandedId === program.id} timeout="auto">
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eee' }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                            Mô tả:
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {program.description}
                          </Typography>

                          <Divider sx={{ mb: 2 }} />

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              Các mức độ của chương trình
                            </Typography>
                            <Button variant="outlined" size="small" onClick={() => handleOpenCreateLevel(program.id)}>
                              Thêm mức độ
                            </Button>
                          </Box>

                          {program.levels.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              Chương trình này chưa có mức độ nào.
                            </Typography>
                          ) : (
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              {program.levels.map((level) => (
                                <Chip
                                  key={level.id}
                                  label={`${level.code} - ${level.name}`}
                                  variant="outlined"
                                  onClick={() => setActiveTab(1)}
                                />
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 1 && (
        <>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm mức độ (mã, tên, chương trình...)"
              value={levelSearchQuery}
              onChange={(e) => setLevelSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              variant="outlined"
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Luồng đúng là tạo chương trình học trước, sau đó mới thêm mức độ cho chương trình đó.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenCreateLevel()}>
              Tạo mức độ
            </Button>
          </Box>

          {loadingLevels ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredLevels.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {levelSearchQuery ? 'Không tìm thấy mức độ nào' : 'Chưa có mức độ nào'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredLevels.map((level) => (
                <Grid xs={12} md={6} key={level.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Box sx={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpandedLevelId(expandedLevelId === level.id ? null : level.id)}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton size="small" onClick={(e) => {
                              e.stopPropagation();
                              setExpandedLevelId(expandedLevelId === level.id ? null : level.id);
                            }}>
                              {expandedLevelId === level.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            <Box>
                              <Typography variant="h6" fontWeight={700}>
                                {level.code} - {level.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {level.courseName || 'Chưa gắn chương trình'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleOpenEditLevel(level)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteLevel(level.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>

                      <Collapse in={expandedLevelId === level.id} timeout="auto">
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {level.description || 'Không có mô tả'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            <Chip label={`Thứ tự: ${level.displayOrder ?? '-'}`} size="small" />
                            <Chip label={`Học phí: ${level.basePrice.toLocaleString('vi-VN')}đ`} size="small" />
                            <Chip label={`Số tuần: ${level.durationWeeks ?? '-'} tuần`} size="small" />
                            <Chip
                              label={level.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                              size="small"
                              color={level.isActive ? 'success' : 'default'}
                            />
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                            Các lớp học ({(level.classes || []).length})
                          </Typography>

                          {!level.classes || level.classes.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              Mức độ này chưa có lớp học nào.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {level.classes.map((clazz: Clazz) => (
                                <Paper 
                                  key={clazz.id} 
                                  sx={{ p: 1.5, bgcolor: 'background.default', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: 'action.hover', boxShadow: 2 } }}
                                  onClick={() => handleOpenClassDetails(clazz)}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" fontWeight={600}>
                                        {clazz.name}
                                      </Typography>
                                      {clazz.teacherName && (
                                        <Typography variant="caption" color="text.secondary">
                                          GV: {clazz.teacherName}
                                        </Typography>
                                      )}
                                      <Chip
                                        label={clazz.status || 'Chưa rõ'}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                        color={clazz.status === 'ACCEPTING' ? 'success' : clazz.status === 'FULL' ? 'warning' : 'default'}
                                      />
                                    </Box>
                                  </Box>
                                </Paper>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Dialog open={openProgramDialog} onClose={() => setOpenProgramDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProgramId ? 'Chỉnh sửa chương trình' : 'Tạo chương trình mới'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tên chương trình"
            margin="normal"
            value={programForm.name}
            onChange={(e) => setProgramForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="VD: IELTS Preparation"
          />

          <TextField
            fullWidth
            label="Mô tả"
            margin="normal"
            multiline
            rows={3}
            value={programForm.description}
            onChange={(e) => setProgramForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Mô tả chi tiết về chương trình học"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProgramDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleSubmitProgram()}>
            {submitting ? 'Đang lưu...' : editingProgramId ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openLevelDialog} 
        onClose={() => {
          setOpenLevelDialog(false);
          setLevelFormSourceType('tab');
          setLevelForm(defaultLevelForm);
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>{editingLevelId ? 'Chỉnh sửa mức độ' : 'Tạo mức độ mới'}</DialogTitle>
        <DialogContent>
          {levelFormSourceType === 'tab' && (
            <TextField
              select
              fullWidth
              label="Chương trình"
              margin="normal"
              value={levelForm.courseId}
              onChange={(e) => setLevelForm((prev) => ({ ...prev, courseId: e.target.value }))}
            >
              {programs.length === 0 ? (
                <MenuItem disabled value="">
                  Chưa có chương trình nào
                </MenuItem>
              ) : (
                programs.map((program) => (
                  <MenuItem key={program.id} value={program.id}>
                    {program.name}
                  </MenuItem>
                ))
              )}
            </TextField>
          )}
          {levelFormSourceType === 'program' && (
            <TextField
              fullWidth
              label="Chương trình"
              margin="normal"
              value={programs.find((p) => p.id === levelForm.courseId)?.name || ''}
              disabled
              variant="outlined"
            />
          )}

          <TextField
            fullWidth
            label="Mã mức độ (Tùy chọn)"
            margin="normal"
            placeholder="Để trống để tự động sinh"
            value={levelForm.code}
            onChange={(e) => setLevelForm((prev) => ({ ...prev, code: e.target.value }))}
          />

          <TextField
            fullWidth
            label="Tên mức độ"
            margin="normal"
            value={levelForm.name}
            onChange={(e) => setLevelForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="VD: IELTS Foundation"
          />

          <TextField
            fullWidth
            label="Mô tả"
            margin="normal"
            multiline
            rows={3}
            value={levelForm.description}
            onChange={(e) => setLevelForm((prev) => ({ ...prev, description: e.target.value }))}
          />

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Học phí"
                type="number"
                value={levelForm.basePrice}
                onChange={(e) => setLevelForm((prev) => ({ ...prev, basePrice: e.target.value }))}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số tuần"
                type="number"
                value={levelForm.durationWeeks}
                onChange={(e) => setLevelForm((prev) => ({ ...prev, durationWeeks: e.target.value }))}
              />
            </Grid>
          </Grid>

          <TextField
            select
            fullWidth
            label="Trạng thái"
            margin="normal"
            value={levelForm.isActive ? 'true' : 'false'}
            onChange={(e) => setLevelForm((prev) => ({ ...prev, isActive: e.target.value === 'true' }))}
          >
            <MenuItem value="true">Đang hoạt động</MenuItem>
            <MenuItem value="false">Ngừng hoạt động</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLevelDialog(false)}>Hủy</Button>
          <Button variant="contained" disabled={submitting} onClick={() => void handleSubmitLevel()}>
            {submitting ? 'Đang lưu...' : editingLevelId ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!selectedClass} onClose={() => setSelectedClass(null)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.02)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} alignItems={isMobile ? 'flex-start' : 'center'}>
            <Box>
              <Typography variant="h5" fontWeight={900} color="primary.main">
                {activeClass?.name || 'Chi tiết lớp học'}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {activeClass?.courseName || 'Khóa học chưa xác định'}
                {activeClass?.roomName ? ` • Phòng ${activeClass.roomName}` : ''}
                {activeClass?.teacherName ? ` • GV: ${activeClass.teacherName}` : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip label={getStatusLabel(activeClass?.status)} color={getStatusColor(activeClass?.status)} sx={{ fontWeight: 800 }} />
              <Button variant="outlined" size="small" onClick={() => setSelectedClass(null)} sx={{ borderRadius: 2 }}>Đóng</Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>HỌC VIÊN HIỆN TẠI</Typography>
                  <Typography variant="h4" fontWeight={900}>{enrollments.length} / {activeClass?.maxStudents || '-'}</Typography>
                  <LinearProgress
                    value={activeClass?.maxStudents ? (enrollments.length / activeClass.maxStudents) * 100 : 0}
                    variant="determinate"
                    sx={{ mt: 2, height: 8, borderRadius: 4 }}
                  />
                </Paper>
              </Grid>
              <Grid xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>TỔNG BUỔI HỌC</Typography>
                  <Typography variant="h4" fontWeight={900}>{scheduleSessionRows.length}</Typography>
                  <Typography variant="body2" color="primary" fontWeight={700} sx={{ mt: 1 }}>Buổi học</Typography>
                </Paper>
              </Grid>
              <Grid xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" gutterBottom>THỜI GIAN KHÓA HỌC</Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatDateToDDMMYYYY(activeClass?.startDate)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">đến</Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatDateToDDMMYYYY(activeClass?.endDate)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Tabs
              value={detailTab}
              onChange={(_, value) => setDetailTab(value)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Lịch học chi tiết" sx={{ fontWeight: 700 }} />
              <Tab label="Danh sách học viên" sx={{ fontWeight: 700 }} />
              <Tab label="Điểm danh hôm nay" sx={{ fontWeight: 700 }} />
            </Tabs>

            {detailLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
              </Box>
            ) : detailTab === 0 ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.01)' }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5 }}>
                      {scheduleMode === 'edit' ? 'Cập nhật lịch học' : 'Thêm lịch học mới'}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 1.5,
                        alignItems: { xs: 'stretch', md: 'flex-end' },
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(25, 118, 210, 0.03)',
                        border: '1px solid rgba(25, 118, 210, 0.10)',
                      }}
                    >
                      <TextField
                        select
                        fullWidth
                        label="Ngày trong tuần"
                        value={scheduleForm.dayOfWeek}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, dayOfWeek: e.target.value }))}
                        sx={{ flex: { md: '1.2 1 0%' }, minWidth: { md: 220 } }}
                      >
                        <MenuItem value="MONDAY">Thứ Hai</MenuItem>
                        <MenuItem value="TUESDAY">Thứ Ba</MenuItem>
                        <MenuItem value="WEDNESDAY">Thứ Tư</MenuItem>
                        <MenuItem value="THURSDAY">Thứ Năm</MenuItem>
                        <MenuItem value="FRIDAY">Thứ Sáu</MenuItem>
                        <MenuItem value="SATURDAY">Thứ Bảy</MenuItem>
                        <MenuItem value="SUNDAY">Chủ Nhật</MenuItem>
                      </TextField>
                      <TextField
                        type="time"
                        fullWidth
                        label="Giờ bắt đầu"
                        value={scheduleForm.startTime}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: { md: '0.9 1 0%' }, minWidth: { md: 170 } }}
                      />
                      <TextField
                        type="time"
                        fullWidth
                        label="Giờ kết thúc"
                        value={scheduleForm.endTime}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                        sx={{ flex: { md: '0.9 1 0%' }, minWidth: { md: 170 } }}
                      />
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => void handleSaveSchedule()}
                        sx={{
                          borderRadius: 2,
                          py: 1.2,
                          fontWeight: 800,
                          minHeight: 56,
                          whiteSpace: 'nowrap',
                          px: 3,
                          flex: { md: '0 0 180px' },
                        }}
                      >
                        {scheduleMode === 'edit' ? 'Lưu thay đổi' : 'Thêm vào lịch'}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={9}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={800}>Lịch học chi tiết theo từng buổi</Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Tổng số: {scheduleSessionRows.length}
                    </Typography>
                  </Stack>
                  {scheduleSessionRows.length ? (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, maxHeight: 560 }}>
                      <Table size="small" stickyHeader>
                        <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>TT</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Ngày học</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Tiết học</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Phòng học</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Hình thức</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Điểm danh</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Giảng viên</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Tiêu đề</TableCell>
                            <TableCell sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>Học liệu</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {scheduleSessionRows.map((session, index) => (
                            <TableRow key={session.key} hover>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{index + 1}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.dateLabel}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.timeLabel}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.roomLabel}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                <Chip
                                  size="small"
                                  label={session.formatLabel}
                                  color={session.formatLabel === 'Trực tiếp' ? 'success' : 'info'}
                                  variant="outlined"
                                  sx={{ fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                <Chip
                                  size="small"
                                  label={session.attendanceLabel}
                                  color="error"
                                  variant="outlined"
                                  sx={{ fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.teacherLabel}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.titleLabel}</TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>{session.materialLabel}</TableCell>
                              <TableCell align="center">
                                <Stack direction="row" spacing={1} justifyContent="center">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openScheduleDialog(selectedClassId || activeClass?.id || '', {
                                        id: session.scheduleId,
                                        dayOfWeek: session.dayOfWeek || 'MONDAY',
                                        startTime: session.startTime || '18:00',
                                        endTime: session.endTime || '20:00',
                                      });
                                    }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const idToDelete = session.scheduleId || String(session.key).split('-')[0];
                                      if (!idToDelete) return;
                                      if (window.confirm('Bạn có chắc chắn muốn xóa buổi học này?')) {
                                        void handleDeleteSchedule(idToDelete);
                                      }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>Lớp học này chưa được xếp lịch.</Alert>
                  )}
                </Grid>
              </Grid>
            ) : detailTab === 1 ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={800}>Học viên đang theo học ({enrollments.length})</Typography>
                  <Button variant="outlined" startIcon={<PeopleIcon />} sx={{ borderRadius: 2 }}>Thêm học viên</Button>
                </Box>
                {enrollments.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>Chưa có học viên nào tham gia lớp học này.</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Họ và tên</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Mã học viên</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Ngày đăng ký</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Hành động</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {enrollments.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell sx={{ fontWeight: 700 }}>{item.studentName}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{item.studentId}</TableCell>
                            <TableCell>{formatDateToDDMMYYYY(item.enrollmentDate)}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.status === 'ACTIVE' ? 'Đang học' : 'Dừng học'} color={item.status === 'ACTIVE' ? 'success' : 'default'} sx={{ fontWeight: 700 }} />
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" variant="text" onClick={() => void handleOpenStudent(item)} sx={{ fontWeight: 700 }}>
                                Xem kết quả
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Tình hình điểm danh ngày {formatDateToDDMMYYYY(todayIso)}</Typography>
                {attendance.length === 0 ? (
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>Dữ liệu điểm danh ngày hôm nay chưa được cập nhật hoặc không có lịch học.</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Học viên</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Trạng thái</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Ghi chú</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendance.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell sx={{ fontWeight: 700 }}>{row.studentName}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={row.status === 'PRESENT' ? 'Có mặt' : row.status === 'ABSENT' ? 'Vắng mặt' : row.status === 'LATE' ? 'Đi muộn' : 'Có phép'}
                                color={row.status === 'PRESENT' ? 'success' : row.status === 'ABSENT' ? 'error' : 'warning'}
                                sx={{ fontWeight: 700 }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{row.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}