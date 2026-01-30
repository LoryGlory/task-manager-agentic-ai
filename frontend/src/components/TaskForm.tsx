/**
 * TaskForm component for creating and editing tasks.
 * AI-generated component with Material UI and validation.
 */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import type { Task, TaskStatus } from '../types/Task';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialTask?: Task;
}

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

export default function TaskForm({ open, onClose, onSubmit, initialTask }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState<Dayjs | null>(null);
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setStatus(initialTask.status);
      setCategory(initialTask.category || '');
      setDueDate(initialTask.dueDate ? dayjs(initialTask.dueDate) : null);
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setCategory('');
      setDueDate(null);
    }
    setTitleError('');
    setDescriptionError('');
  }, [initialTask, open]);

  const validateTitle = (value: string): boolean => {
    if (!value.trim()) {
      setTitleError('Title is required');
      return false;
    }
    if (value.length > TITLE_MAX_LENGTH) {
      setTitleError(`Title must not exceed ${TITLE_MAX_LENGTH} characters`);
      return false;
    }
    setTitleError('');
    return true;
  };

  const validateDescription = (value: string): boolean => {
    if (value.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(`Description must not exceed ${DESCRIPTION_MAX_LENGTH} characters`);
      return false;
    }
    setDescriptionError('');
    return true;
  };

  const handleSubmit = () => {
    const isTitleValid = validateTitle(title);
    const isDescriptionValid = validateDescription(description);

    if (!isTitleValid || !isDescriptionValid) {
      return;
    }

    const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      category: category.trim() || undefined,
      dueDate: dueDate ? dueDate.format('YYYY-MM-DD') : undefined,
    };

    onSubmit(task);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{initialTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Title Field */}
            <Box>
              <TextField
                label="Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  validateTitle(e.target.value);
                }}
                error={!!titleError}
                helperText={titleError}
                required
                fullWidth
                autoFocus
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {title.length}/{TITLE_MAX_LENGTH} characters
              </Typography>
            </Box>

            {/* Description Field */}
            <Box>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  validateDescription(e.target.value);
                }}
                error={!!descriptionError}
                helperText={descriptionError}
                multiline
                rows={4}
                fullWidth
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {description.length}/{DESCRIPTION_MAX_LENGTH} characters
              </Typography>
            </Box>

            {/* Status Field */}
            <TextField
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              select
              fullWidth
            >
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </TextField>

            {/* Category Field */}
            <TextField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Work, Personal, Shopping"
              fullWidth
            />

            {/* Due Date Field */}
            <DatePicker
              label="Due Date"
              value={dueDate}
              onChange={(newValue) => setDueDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
                actionBar: {
                  actions: ['clear', 'today'],
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {initialTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
