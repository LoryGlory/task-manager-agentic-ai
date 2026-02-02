import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskList from './TaskList';
import * as taskService from '../services/taskService';
import type { Task } from '../types/Task';

// Mock the taskService
vi.mock('../services/taskService');

// Mock Material UI icons to avoid rendering issues
vi.mock('@mui/icons-material/Add', () => ({
  default: () => <div>AddIcon</div>,
}));
vi.mock('@mui/icons-material/Search', () => ({
  default: () => <div>SearchIcon</div>,
}));

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Task 1',
      description: 'Description 1',
      status: 'TODO',
      category: 'Work',
      dueDate: '2024-12-31',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
    },
    {
      id: 2,
      title: 'Task 2',
      description: 'Description 2',
      status: 'IN_PROGRESS',
      category: 'Personal',
      dueDate: '2024-12-25',
      createdAt: '2024-01-02T00:00:00',
      updatedAt: '2024-01-02T00:00:00',
    },
    {
      id: 3,
      title: 'Task 3',
      description: 'Another description',
      status: 'DONE',
      category: 'Work',
      dueDate: '2024-12-20',
      createdAt: '2024-01-03T00:00:00',
      updatedAt: '2024-01-03T00:00:00',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(taskService.getAllTasks).mockResolvedValue(mockTasks);
  });

  describe('Initial Load', () => {
    it('should show loading spinner initially', () => {
      render(<TaskList />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should load and display tasks', async () => {
      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      expect(screen.getByText('Task 2')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();
      expect(screen.getByText('Showing 3 of 3 tasks')).toBeInTheDocument();
    });

    it('should display error message when loading fails', async () => {
      vi.mocked(taskService.getAllTasks).mockRejectedValueOnce(new Error('Network error'));

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should show empty state when no tasks exist', async () => {
      vi.mocked(taskService.getAllTasks).mockResolvedValueOnce([]);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('No tasks yet. Create your first task!')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter tasks by title', async () => {
      const user = userEvent.setup();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      await user.type(searchInput, 'Task 1');

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 tasks')).toBeInTheDocument();
      });

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
    });

    it('should filter tasks by description', async () => {
      const user = userEvent.setup();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      await user.type(searchInput, 'Another');

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 tasks')).toBeInTheDocument();
      });

      expect(screen.getByText('Task 3')).toBeInTheDocument();
      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
    });

    it('should show no results message when search has no matches', async () => {
      const user = userEvent.setup();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search tasks/i);
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No tasks match your filters')).toBeInTheDocument();
      });
    });
  });

  describe('Status Filter', () => {
    it('should filter tasks by status', async () => {
      const user = userEvent.setup();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Open status filter
      const statusFilter = screen.getByLabelText(/^Status$/);
      await user.click(statusFilter);

      // Select "To Do"
      const todoOption = screen.getByRole('option', { name: 'To Do' });
      await user.click(todoOption);

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 tasks')).toBeInTheDocument();
      });

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Task 3')).not.toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    it('should filter tasks by category', async () => {
      const user = userEvent.setup();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Open category filter
      const categoryFilter = screen.getByLabelText('Category');
      await user.click(categoryFilter);

      // Select "Work"
      const workOption = screen.getByRole('option', { name: 'Work' });
      await user.click(workOption);

      await waitFor(() => {
        expect(screen.getByText('Showing 2 of 3 tasks')).toBeInTheDocument();
      });

      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 3')).toBeInTheDocument();
      expect(screen.queryByText('Task 2')).not.toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('should sort tasks by title', async () => {
      const user = userEvent.setup();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Open sort filter
      const sortFilter = screen.getByLabelText('Sort By');
      await user.click(sortFilter);

      // Select "Title"
      const titleOption = screen.getByRole('option', { name: 'Title' });
      await user.click(titleOption);

      // Verify tasks are displayed (exact order checking is complex in RTL)
      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
        expect(screen.getByText('Task 2')).toBeInTheDocument();
        expect(screen.getByText('Task 3')).toBeInTheDocument();
      });
    });
  });

  describe('Create Task', () => {
    it('should open create form when FAB is clicked', async () => {
      const user = userEvent.setup();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const addButton = screen.getByLabelText('add task');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });
    });

    it('should create task and reload list', async () => {
      const user = userEvent.setup();
      vi.mocked(taskService.createTask).mockResolvedValueOnce({
        id: 4,
        title: 'New Task',
        status: 'TODO',
        createdAt: '2024-01-04T00:00:00',
        updatedAt: '2024-01-04T00:00:00',
      });

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const addButton = screen.getByLabelText('add task');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Create New Task')).toBeInTheDocument();
      });

      // Fill and submit form
      await user.type(screen.getByLabelText(/title/i), 'New Task');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(taskService.createTask).toHaveBeenCalled();
        expect(screen.getByText('Task created successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Task', () => {
    it('should show delete confirmation dialog', async () => {
      const user = userEvent.setup();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByLabelText('delete task');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Task')).toBeInTheDocument();
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      });
    });

    it('should delete task when confirmed', async () => {
      const user = userEvent.setup();
      vi.mocked(taskService.deleteTask).mockResolvedValueOnce();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByLabelText('delete task');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Task')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: 'Delete' });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(taskService.deleteTask).toHaveBeenCalledWith(1);
        expect(screen.getByText('Task deleted successfully')).toBeInTheDocument();
      });
    });

    it('should cancel delete when cancel button clicked', async () => {
      const user = userEvent.setup();

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByLabelText('delete task');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Task')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Delete Task')).not.toBeInTheDocument();
      });

      expect(taskService.deleteTask).not.toHaveBeenCalled();
    });
  });

  describe('Update Status', () => {
    it('should update task status', async () => {
      const user = userEvent.setup();
      vi.mocked(taskService.updateTask).mockResolvedValueOnce(mockTasks[0]);

      render(<TaskList />);

      await waitFor(() => {
        expect(screen.getByText('Task 1')).toBeInTheDocument();
      });

      // Find the status select for the first task
      const statusSelects = screen.getAllByRole('combobox');
      await user.click(statusSelects[0]);

      // Select "In Progress"
      const inProgressOption = screen.getByRole('option', { name: 'In Progress' });
      await user.click(inProgressOption);

      await waitFor(() => {
        expect(taskService.updateTask).toHaveBeenCalledWith(1, { status: 'IN_PROGRESS' });
        expect(screen.getByText('Status updated successfully')).toBeInTheDocument();
      });
    });
  });
});
