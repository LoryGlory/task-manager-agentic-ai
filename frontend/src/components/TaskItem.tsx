/**
 * TaskItem component for displaying individual tasks.
 * AI-generated component with Material UI and status management.
 */
import {
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Box,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import LabelIcon from '@mui/icons-material/Label';
import dayjs from 'dayjs';
import type { Task, TaskStatus } from '../types/Task';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: TaskStatus) => void;
}

const STATUS_COLORS: Record<TaskStatus, 'default' | 'primary' | 'success'> = {
  TODO: 'default',
  IN_PROGRESS: 'primary',
  DONE: 'success',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export default function TaskItem({ task, onEdit, onDelete, onStatusChange }: TaskItemProps) {
  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && task.status !== 'DONE';

  const handleStatusChange = (event: SelectChangeEvent<TaskStatus>) => {
    if (task.id) {
      onStatusChange(task.id, event.target.value as TaskStatus);
    }
  };

  const handleEdit = () => {
    onEdit(task);
  };

  const handleDelete = () => {
    if (task.id) {
      onDelete(task.id);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: isOverdue ? '2px solid' : '1px solid',
        borderColor: isOverdue ? 'error.main' : 'divider',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          borderColor: isOverdue ? 'error.main' : 'primary.main',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header with Status and Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Select
            value={task.status}
            onChange={handleStatusChange}
            size="small"
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="TODO">To Do</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="DONE">Done</MenuItem>
          </Select>

          <Box>
            <IconButton size="small" onClick={handleEdit} color="primary" aria-label="edit task">
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDelete} color="error" aria-label="delete task">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            textDecoration: task.status === 'DONE' ? 'line-through' : 'none',
            color: task.status === 'DONE' ? 'text.secondary' : 'text.primary',
            fontWeight: 600,
            fontSize: '1.125rem',
          }}
        >
          {task.title}
        </Typography>

        {/* Description */}
        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {task.description}
          </Typography>
        )}

        {/* Chips: Category and Due Date */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
          {/* Status Chip */}
          <Chip
            label={STATUS_LABELS[task.status]}
            color={STATUS_COLORS[task.status]}
            size="small"
          />

          {/* Category Chip */}
          {task.category && (
            <Chip
              icon={<LabelIcon />}
              label={task.category}
              size="small"
              variant="outlined"
            />
          )}

          {/* Due Date Chip */}
          {task.dueDate && (
            <Chip
              icon={<EventIcon />}
              label={dayjs(task.dueDate).format('MMM D, YYYY')}
              size="small"
              color={isOverdue ? 'error' : 'default'}
              variant={isOverdue ? 'filled' : 'outlined'}
            />
          )}
        </Box>

        {/* Overdue Warning */}
        {isOverdue && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            ⚠️ Overdue
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
