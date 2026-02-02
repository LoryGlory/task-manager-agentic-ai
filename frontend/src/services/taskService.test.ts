import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from './taskService';
import type { Task } from '../types/Task';

// Mock fetch globally
global.fetch = vi.fn();

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should fetch all tasks successfully', async () => {
      const mockTasks: Task[] = [
        {
          id: 1,
          title: 'Test Task 1',
          description: 'Description 1',
          status: 'TODO',
          category: 'Work',
          dueDate: '2024-12-31',
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        },
        {
          id: 2,
          title: 'Test Task 2',
          description: 'Description 2',
          status: 'IN_PROGRESS',
          category: 'Personal',
          dueDate: '2024-12-25',
          createdAt: '2024-01-02T00:00:00',
          updatedAt: '2024-01-02T00:00:00',
        },
      ];

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTasks,
      });

      const result = await getAllTasks();

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/tasks');
      expect(result).toEqual(mockTasks);
    });

    it('should throw error when fetch fails', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      });

      await expect(getAllTasks()).rejects.toThrow('HTTP 500: Server error');
    });
  });

  describe('getTaskById', () => {
    it('should fetch a task by ID successfully', async () => {
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

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      });

      const result = await getTaskById(1);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/tasks/1');
      expect(result).toEqual(mockTask);
    });

    it('should throw error when task not found', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Task not found',
      });

      await expect(getTaskById(999)).rejects.toThrow('HTTP 404: Task not found');
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        status: 'TODO' as const,
        category: 'Work',
        dueDate: '2024-12-31',
      };

      const createdTask: Task = {
        id: 1,
        ...newTask,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => createdTask,
      });

      const result = await createTask(newTask);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      expect(result).toEqual(createdTask);
    });

    it('should throw error when validation fails', async () => {
      const invalidTask = {
        title: '',
        description: 'Description',
        status: 'TODO' as const,
        category: 'Work',
        dueDate: '2024-12-31',
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Title is required',
      });

      await expect(createTask(invalidTask)).rejects.toThrow('HTTP 400: Title is required');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updates = {
        title: 'Updated Title',
        status: 'DONE' as const,
      };

      const updatedTask: Task = {
        id: 1,
        title: 'Updated Title',
        description: 'Description',
        status: 'DONE',
        category: 'Work',
        dueDate: '2024-12-31',
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-02T00:00:00',
      };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTask,
      });

      const result = await updateTask(1, updates);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/tasks/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      expect(result).toEqual(updatedTask);
    });

    it('should throw error when task not found', async () => {
      const updates = { title: 'Updated Title' };

      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Task not found',
      });

      await expect(updateTask(999, updates)).rejects.toThrow('HTTP 404: Task not found');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await deleteTask(1);

      expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/tasks/1', {
        method: 'DELETE',
      });
    });

    it('should throw error when task not found', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Task not found',
      });

      await expect(deleteTask(999)).rejects.toThrow('HTTP 404: Task not found');
    });
  });
});
