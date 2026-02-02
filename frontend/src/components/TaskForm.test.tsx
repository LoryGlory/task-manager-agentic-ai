import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from './TaskForm';
import type { Task } from '../types/Task';

describe('TaskForm', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create form with empty fields', () => {
      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.getByText('Create New Task')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
      expect(screen.getByLabelText(/status/i)).toHaveTextContent('To Do');
      expect(screen.getByLabelText(/category/i)).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });

    it('should show character counters', () => {
      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.getByText('0/100 characters')).toBeInTheDocument();
      expect(screen.getByText('0/500 characters')).toBeInTheDocument();
    });

    it('should update character counter as user types', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Task');

      expect(screen.getByText('9/100 characters')).toBeInTheDocument();
    });

    it('should validate required title field', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      expect(screen.getByText('Title is required')).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate title max length', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/title/i);
      const longTitle = 'a'.repeat(101);
      await user.type(titleInput, longTitle);

      expect(screen.getByText('Title must not exceed 100 characters')).toBeInTheDocument();

      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate description max length', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const descriptionInput = screen.getByLabelText(/description/i);
      const longDescription = 'a'.repeat(501);
      await user.type(descriptionInput, longDescription);

      expect(screen.getByText('Description must not exceed 500 characters')).toBeInTheDocument();

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Valid Title');

      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      // Fill in the form
      await user.type(screen.getByLabelText(/title/i), 'New Task');
      await user.type(screen.getByLabelText(/description/i), 'Task description');
      await user.type(screen.getByLabelText(/category/i), 'Work');

      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'Task description',
          status: 'TODO',
          category: 'Work',
          dueDate: undefined,
        });
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should submit form with minimal required data', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/title/i), 'Minimal Task');

      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Minimal Task',
          description: undefined,
          status: 'TODO',
          category: undefined,
          dueDate: undefined,
        });
      });
    });

    it('should change status', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const statusSelect = screen.getByLabelText(/status/i);
      await user.click(statusSelect);

      const inProgressOption = screen.getByRole('option', { name: 'In Progress' });
      await user.click(inProgressOption);

      await user.type(screen.getByLabelText(/title/i), 'Task with status');

      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'IN_PROGRESS',
          })
        );
      });
    });

    it('should close form when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should trim whitespace from fields', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      await user.type(screen.getByLabelText(/title/i), '  Trimmed Task  ');
      await user.type(screen.getByLabelText(/description/i), '  Trimmed Description  ');
      await user.type(screen.getByLabelText(/category/i), '  Trimmed Category  ');

      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Trimmed Task',
          description: 'Trimmed Description',
          status: 'TODO',
          category: 'Trimmed Category',
          dueDate: undefined,
        });
      });
    });
  });

  describe('Edit Mode', () => {
    const existingTask: Task = {
      id: 1,
      title: 'Existing Task',
      description: 'Existing Description',
      status: 'IN_PROGRESS',
      category: 'Work',
      dueDate: '2024-12-31',
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00',
    };

    it('should render edit form with existing task data', () => {
      render(
        <TaskForm
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialTask={existingTask}
        />
      );

      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Task');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Existing Description');
      expect(screen.getByLabelText(/category/i)).toHaveValue('Work');
      expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
    });

    it('should update existing task', async () => {
      const user = userEvent.setup();

      render(
        <TaskForm
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialTask={existingTask}
        />
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Task');

      const updateButton = screen.getByRole('button', { name: 'Update' });
      await user.click(updateButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Updated Task',
          })
        );
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should reset form when switching from edit to create mode', () => {
      const { rerender } = render(
        <TaskForm
          open={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
          initialTask={existingTask}
        />
      );

      expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Task');

      // Rerender without initialTask (create mode)
      rerender(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/title/i)).toHaveValue('');
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should clear validation errors when form is reopened', () => {
      const { rerender } = render(
        <TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />
      );

      // Trigger validation error
      const createButton = screen.getByRole('button', { name: 'Create' });
      createButton.click();

      expect(screen.getByText('Title is required')).toBeInTheDocument();

      // Close and reopen form
      rerender(<TaskForm open={false} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
      rerender(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });

    it('should validate title in real-time', async () => {
      const user = userEvent.setup();

      render(<TaskForm open={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />);

      const titleInput = screen.getByLabelText(/title/i);

      // Type valid title
      await user.type(titleInput, 'Valid');
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();

      // Clear to trigger validation
      await user.clear(titleInput);
      await user.tab(); // Blur to trigger validation

      // Type again
      await user.type(titleInput, ' '); // Just whitespace
      const createButton = screen.getByRole('button', { name: 'Create' });
      await user.click(createButton);

      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });
});
