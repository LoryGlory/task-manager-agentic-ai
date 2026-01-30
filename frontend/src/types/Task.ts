/**
 * Task type definition matching the backend Task entity.
 * AI-generated TypeScript interface for frontend-backend type safety.
 */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: TaskStatus;
  category?: string;
  dueDate?: string; // ISO date format (YYYY-MM-DD)
  createdAt?: string;
  updatedAt?: string;
}
