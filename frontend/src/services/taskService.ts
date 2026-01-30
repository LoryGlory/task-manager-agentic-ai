/**
 * Task API service using fetch API.
 * AI-generated service for backend communication.
 */
import type { Task } from '../types/Task';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/**
 * Handle fetch response and throw errors if needed
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  return handleResponse<Task[]>(response);
}

/**
 * Get a task by ID
 */
export async function getTaskById(id: number): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
  return handleResponse<Task>(response);
}

/**
 * Create a new task
 */
export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
}

/**
 * Update an existing task
 */
export async function updateTask(id: number, task: Partial<Task>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
}

/**
 * Delete a task
 */
export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}
