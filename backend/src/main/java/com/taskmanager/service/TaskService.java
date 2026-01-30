package com.taskmanager.service;

import com.taskmanager.model.Task;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for Task business logic.
 * AI-generated service with CRUD operations and error handling.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    /**
     * Retrieve all tasks.
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    /**
     * Retrieve a task by ID.
     * @throws RuntimeException if task not found
     */
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    /**
     * Create a new task.
     */
    public Task createTask(Task task) {
        // Ensure ID is null for new tasks
        task.setId(null);
        return taskRepository.save(task);
    }

    /**
     * Update an existing task.
     * @throws RuntimeException if task not found
     */
    public Task updateTask(Long id, Task taskDetails) {
        Task existingTask = getTaskById(id);

        // Update fields
        existingTask.setTitle(taskDetails.getTitle());
        existingTask.setDescription(taskDetails.getDescription());
        existingTask.setStatus(taskDetails.getStatus());
        existingTask.setCategory(taskDetails.getCategory());
        existingTask.setDueDate(taskDetails.getDueDate());

        return taskRepository.save(existingTask);
    }

    /**
     * Delete a task by ID.
     * @throws RuntimeException if task not found
     */
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }
}
