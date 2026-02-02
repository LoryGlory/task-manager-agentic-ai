/**
 * TaskList component with search, filter, and sort functionality.
 * AI-generated component managing all tasks and operations.
 */
import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
  Alert,
  CircularProgress,
  Fab,
  InputLabel,
  FormControl,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import type { Task, TaskStatus } from '../types/Task';
import * as taskService from '../services/taskService';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import dayjs from 'dayjs';
import {
  HeaderBox,
  GradientTitle,
  FiltersContainer,
  SearchField,
  FiltersRow,
  TasksGrid,
  fabStyles,
} from './TaskList.styles';

type SortOption = 'status' | 'dueDate' | 'title';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('status');

  // Load tasks on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await taskService.getAllTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from tasks
  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      tasks.map((task) => task.category).filter((cat): cat is string => !!cat)
    );
    return Array.from(uniqueCategories).sort();
  }, [tasks]);

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks;

    // Search filter (debounced via useMemo dependencies)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'ALL') {
      result = result.filter((task) => task.category === categoryFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'status': {
          const statusOrder: Record<TaskStatus, number> = {
            TODO: 1,
            IN_PROGRESS: 2,
            DONE: 3,
          };
          return statusOrder[a.status] - statusOrder[b.status];
        }
        case 'dueDate': {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return dayjs(a.dueDate).diff(dayjs(b.dueDate));
        }
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, searchQuery, statusFilter, categoryFilter, sortBy]);

  // CRUD Operations
  const handleCreateTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await taskService.createTask(task);
      await loadTasks();
      setSuccessMessage('Task created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTask?.id) return;

    try {
      await taskService.updateTask(editingTask.id, task);
      await loadTasks();
      setSuccessMessage('Task updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleStatusChange = async (id: number, status: TaskStatus) => {
    try {
      await taskService.updateTask(id, { status });
      await loadTasks();
      setSuccessMessage('Status updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDeleteTask = (id: number) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete === null) return;

    try {
      await taskService.deleteTask(taskToDelete);
      await loadTasks();
      setSuccessMessage('Task deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    } finally {
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  // Form handlers
  const handleOpenCreateForm = () => {
    setEditingTask(undefined);
    setFormOpen(true);
  };

  const handleOpenEditForm = (task: Task) => {
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingTask(undefined);
  };

  const handleSubmitForm = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      await handleUpdateTask(task);
    } else {
      await handleCreateTask(task);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <HeaderBox>
        <GradientTitle>My Tasks</GradientTitle>
        <Typography variant="body2" color="text.secondary">
          Organize and track your tasks efficiently
        </Typography>
      </HeaderBox>

      {/* Filters and Search */}
      <FiltersContainer>
        {/* Search */}
        <SearchField
          placeholder="Search tasks by title or description..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
            },
          }}
          fullWidth
          variant="outlined"
        />

        {/* Filters Row */}
        <FiltersRow>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e: SelectChangeEvent<TaskStatus | 'ALL'>) =>
                setStatusFilter(e.target.value as TaskStatus | 'ALL')
              }
              label="Status"
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e: SelectChangeEvent) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              onChange={(e: SelectChangeEvent<SortOption>) => setSortBy(e.target.value as SortOption)}
              label="Sort By"
            >
              <MenuItem value="status">Status</MenuItem>
              <MenuItem value="dueDate">Due Date</MenuItem>
              <MenuItem value="title">Title</MenuItem>
            </Select>
          </FormControl>
        </FiltersRow>
      </FiltersContainer>

      {/* Task Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
      </Typography>

      {/* Tasks Grid */}
      {filteredAndSortedTasks.length === 0 ? (
        <Alert severity="info">
          {searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
            ? 'No tasks match your filters'
            : 'No tasks yet. Create your first task!'}
        </Alert>
      ) : (
        <TasksGrid>
          {filteredAndSortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteTask}
              onStatusChange={handleStatusChange}
            />
          ))}
        </TasksGrid>
      )}

      {/* Floating Action Button */}
      <Fab color="primary" aria-label="add task" onClick={handleOpenCreateForm} sx={fabStyles}>
        <AddIcon />
      </Fab>

      {/* Task Form Dialog */}
      <TaskForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        initialTask={editingTask}
      />

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this task? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
