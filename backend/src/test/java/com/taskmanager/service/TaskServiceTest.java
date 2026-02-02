package com.taskmanager.service;

import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for TaskService.
 * Tests business logic with mocked repository.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Unit Tests")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private Task testTask;

    @BeforeEach
    void setUp() {
        testTask = new Task();
        testTask.setId(1L);
        testTask.setTitle("Test Task");
        testTask.setDescription("Test Description");
        testTask.setStatus(TaskStatus.TODO);
        testTask.setCategory("Work");
        testTask.setDueDate(LocalDate.of(2024, 12, 31));
    }

    @Test
    @DisplayName("Should retrieve all tasks")
    void getAllTasks_ShouldReturnAllTasks() {
        // Given
        Task task2 = new Task();
        task2.setId(2L);
        task2.setTitle("Second Task");
        task2.setStatus(TaskStatus.IN_PROGRESS);

        List<Task> expectedTasks = Arrays.asList(testTask, task2);
        when(taskRepository.findAll()).thenReturn(expectedTasks);

        // When
        List<Task> actualTasks = taskService.getAllTasks();

        // Then
        assertThat(actualTasks).hasSize(2);
        assertThat(actualTasks).containsExactly(testTask, task2);
        verify(taskRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should retrieve task by ID when task exists")
    void getTaskById_WhenTaskExists_ShouldReturnTask() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));

        // When
        Task actualTask = taskService.getTaskById(1L);

        // Then
        assertThat(actualTask).isNotNull();
        assertThat(actualTask.getId()).isEqualTo(1L);
        assertThat(actualTask.getTitle()).isEqualTo("Test Task");
        verify(taskRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when task not found by ID")
    void getTaskById_WhenTaskDoesNotExist_ShouldThrowException() {
        // Given
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> taskService.getTaskById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Task not found with id: 999");
        verify(taskRepository, times(1)).findById(999L);
    }

    @Test
    @DisplayName("Should create task and set ID to null")
    void createTask_ShouldSetIdToNullAndSaveTask() {
        // Given
        Task newTask = new Task();
        newTask.setId(999L); // This should be ignored
        newTask.setTitle("New Task");
        newTask.setStatus(TaskStatus.TODO);

        Task savedTask = new Task();
        savedTask.setId(1L);
        savedTask.setTitle("New Task");
        savedTask.setStatus(TaskStatus.TODO);

        when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

        // When
        Task result = taskService.createTask(newTask);

        // Then
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(newTask.getId()).isNull(); // Verify ID was set to null
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("Should update existing task with new details")
    void updateTask_WhenTaskExists_ShouldUpdateAndReturnTask() {
        // Given
        Task updatedDetails = new Task();
        updatedDetails.setTitle("Updated Title");
        updatedDetails.setDescription("Updated Description");
        updatedDetails.setStatus(TaskStatus.DONE);
        updatedDetails.setCategory("Personal");
        updatedDetails.setDueDate(LocalDate.of(2025, 1, 15));

        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        // When
        Task result = taskService.updateTask(1L, updatedDetails);

        // Then
        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getDescription()).isEqualTo("Updated Description");
        assertThat(result.getStatus()).isEqualTo(TaskStatus.DONE);
        assertThat(result.getCategory()).isEqualTo("Personal");
        assertThat(result.getDueDate()).isEqualTo(LocalDate.of(2025, 1, 15));
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).save(testTask);
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent task")
    void updateTask_WhenTaskDoesNotExist_ShouldThrowException() {
        // Given
        Task updatedDetails = new Task();
        updatedDetails.setTitle("Updated Title");

        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> taskService.updateTask(999L, updatedDetails))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Task not found with id: 999");
        verify(taskRepository, times(1)).findById(999L);
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    @DisplayName("Should delete task by ID when task exists")
    void deleteTask_WhenTaskExists_ShouldDeleteTask() {
        // Given
        when(taskRepository.findById(1L)).thenReturn(Optional.of(testTask));
        doNothing().when(taskRepository).delete(testTask);

        // When
        taskService.deleteTask(1L);

        // Then
        verify(taskRepository, times(1)).findById(1L);
        verify(taskRepository, times(1)).delete(testTask);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent task")
    void deleteTask_WhenTaskDoesNotExist_ShouldThrowException() {
        // Given
        when(taskRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> taskService.deleteTask(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Task not found with id: 999");
        verify(taskRepository, times(1)).findById(999L);
        verify(taskRepository, never()).delete(any(Task.class));
    }

    @Test
    @DisplayName("Should return empty list when no tasks exist")
    void getAllTasks_WhenNoTasksExist_ShouldReturnEmptyList() {
        // Given
        when(taskRepository.findAll()).thenReturn(List.of());

        // When
        List<Task> tasks = taskService.getAllTasks();

        // Then
        assertThat(tasks).isEmpty();
        verify(taskRepository, times(1)).findAll();
    }
}
