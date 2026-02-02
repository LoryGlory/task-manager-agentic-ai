import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from './TaskItem';
import type { Task } from '../types/Task';

// Mock dayjs to control date comparison for overdue testing
vi.mock('dayjs', () => {
  const actual = vi.importActual('dayjs');
  return {
    default: vi.fn((date?: string) => {
      const dayjs = actual.default as any;
      if (date) {
        return dayjs(date);
      }
      // Mock "today" as 2024-12-01
      return dayjs('2024-12-01');
    }),
  };
});

describe('TaskItem', () => {
  const mockTask: Task = {
    id: 1,
    title: 'Test Task',
    description: 'Test Description',
    status: 'TODO',
    category: 'Work',
    dueDate: '2024-12-31',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render task with all properties', () => {
    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument();
  });

  it('should render without optional fields', () => {
    const minimalTask: Task = {
      id: 1,
      title: 'Minimal Task',
      status: 'TODO',
    };

    render(
      <TaskItem
        task={minimalTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Minimal Task')).toBeInTheDocument();
    expect(screen.queryByText(/Test Description/i)).not.toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const editButton = screen.getByLabelText('edit task');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const deleteButton = screen.getByLabelText('delete task');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(1);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should call onStatusChange when status is changed', async () => {
    const user = userEvent.setup();

    render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    // Click on the status select to open dropdown
    const statusSelect = screen.getByRole('combobox');
    await user.click(statusSelect);

    // Click on "In Progress" option
    const inProgressOption = screen.getByRole('option', { name: 'In Progress' });
    await user.click(inProgressOption);

    expect(mockOnStatusChange).toHaveBeenCalledWith(1, 'IN_PROGRESS');
  });

  it('should display correct status chip color', () => {
    const { rerender } = render(
      <TaskItem
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();

    // Change to IN_PROGRESS
    rerender(
      <TaskItem
        task={{ ...mockTask, status: 'IN_PROGRESS' }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    // Change to DONE
    rerender(
      <TaskItem
        task={{ ...mockTask, status: 'DONE' }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('should show overdue warning for past due date', () => {
    const overdueTask: Task = {
      ...mockTask,
      dueDate: '2024-11-01', // Before mocked "today" (2024-12-01)
      status: 'TODO',
    };

    render(
      <TaskItem
        task={overdueTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('⚠️ Overdue')).toBeInTheDocument();
  });

  it('should not show overdue warning for future due date', () => {
    const futureTask: Task = {
      ...mockTask,
      dueDate: '2024-12-31', // After mocked "today" (2024-12-01)
      status: 'TODO',
    };

    render(
      <TaskItem
        task={futureTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.queryByText('⚠️ Overdue')).not.toBeInTheDocument();
  });

  it('should not show overdue warning for completed tasks', () => {
    const completedOverdueTask: Task = {
      ...mockTask,
      dueDate: '2024-11-01', // Past date
      status: 'DONE', // But completed
    };

    render(
      <TaskItem
        task={completedOverdueTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.queryByText('⚠️ Overdue')).not.toBeInTheDocument();
  });

  it('should not call onDelete when task has no id', async () => {
    const user = userEvent.setup();
    const taskWithoutId: Task = {
      title: 'New Task',
      status: 'TODO',
    };

    render(
      <TaskItem
        task={taskWithoutId}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const deleteButton = screen.getByLabelText('delete task');
    await user.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should not call onStatusChange when task has no id', async () => {
    const user = userEvent.setup();
    const taskWithoutId: Task = {
      title: 'New Task',
      status: 'TODO',
    };

    render(
      <TaskItem
        task={taskWithoutId}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByRole('combobox');
    await user.click(statusSelect);

    const doneOption = screen.getByRole('option', { name: 'Done' });
    await user.click(doneOption);

    expect(mockOnStatusChange).not.toHaveBeenCalled();
  });
});
