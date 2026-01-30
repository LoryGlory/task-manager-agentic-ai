/**
 * TaskList component with search, filter, and sort functionality.
 * AI-generated component managing all tasks and operations.
 */
import { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Grid,
  Box,
  TextField,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Alert,
  CircularProgress,
  Fab,
  InputLabel,
  FormControl,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Task, TaskStatus } from '../types/Task';
import * as taskService from '../services/taskService';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import dayjs from 'dayjs';

type SortOption = 'status' | 'dueDate' | 'title';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

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

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.deleteTask(id);
      await loadTasks();
      setSuccessMessage('Task deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        Task Manager
      </Typography>

      {/* Filters and Search */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Search */}
        <TextField
          placeholder="Search tasks by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
          fullWidth
        />

        {/* Filters Row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
        </Box>
      </Box>

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
        <Grid container spacing={3}>
          {filteredAndSortedTasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <TaskItem
                task={task}
                onEdit={handleOpenEditForm}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add task"
        onClick={handleOpenCreateForm}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
        }}
      >
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
    </Container>
  );
}
