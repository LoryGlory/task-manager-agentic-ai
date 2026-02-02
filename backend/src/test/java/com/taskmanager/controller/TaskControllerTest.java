package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for TaskController.
 * Tests REST endpoints with MockMvc.
 */
@WebMvcTest(TaskController.class)
@DisplayName("TaskController Integration Tests")
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
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
    @DisplayName("GET /api/tasks - Should return all tasks")
    void getAllTasks_ShouldReturnTaskList() throws Exception {
        // Given
        Task task2 = new Task();
        task2.setId(2L);
        task2.setTitle("Second Task");
        task2.setStatus(TaskStatus.IN_PROGRESS);

        List<Task> tasks = Arrays.asList(testTask, task2);
        when(taskService.getAllTasks()).thenReturn(tasks);

        // When & Then
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id", is(1)))
                .andExpect(jsonPath("$[0].title", is("Test Task")))
                .andExpect(jsonPath("$[0].status", is("TODO")))
                .andExpect(jsonPath("$[1].id", is(2)))
                .andExpect(jsonPath("$[1].title", is("Second Task")))
                .andExpect(jsonPath("$[1].status", is("IN_PROGRESS")));

        verify(taskService, times(1)).getAllTasks();
    }

    @Test
    @DisplayName("GET /api/tasks - Should return empty list when no tasks exist")
    void getAllTasks_WhenNoTasks_ShouldReturnEmptyList() throws Exception {
        // Given
        when(taskService.getAllTasks()).thenReturn(List.of());

        // When & Then
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(0)));

        verify(taskService, times(1)).getAllTasks();
    }

    @Test
    @DisplayName("GET /api/tasks/{id} - Should return task when found")
    void getTaskById_WhenTaskExists_ShouldReturnTask() throws Exception {
        // Given
        when(taskService.getTaskById(1L)).thenReturn(testTask);

        // When & Then
        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Test Task")))
                .andExpect(jsonPath("$.description", is("Test Description")))
                .andExpect(jsonPath("$.status", is("TODO")))
                .andExpect(jsonPath("$.category", is("Work")))
                .andExpect(jsonPath("$.dueDate", is("2024-12-31")));

        verify(taskService, times(1)).getTaskById(1L);
    }

    @Test
    @DisplayName("GET /api/tasks/{id} - Should return 404 when task not found")
    void getTaskById_WhenTaskNotFound_ShouldReturn404() throws Exception {
        // Given
        when(taskService.getTaskById(999L)).thenThrow(new RuntimeException("Task not found"));

        // When & Then
        mockMvc.perform(get("/api/tasks/999"))
                .andExpect(status().isNotFound());

        verify(taskService, times(1)).getTaskById(999L);
    }

    @Test
    @DisplayName("POST /api/tasks - Should create task and return 201")
    void createTask_WithValidData_ShouldCreateAndReturn201() throws Exception {
        // Given
        Task newTask = new Task();
        newTask.setTitle("New Task");
        newTask.setDescription("New Description");
        newTask.setStatus(TaskStatus.TODO);
        newTask.setCategory("Personal");

        Task createdTask = new Task();
        createdTask.setId(1L);
        createdTask.setTitle("New Task");
        createdTask.setDescription("New Description");
        createdTask.setStatus(TaskStatus.TODO);
        createdTask.setCategory("Personal");

        when(taskService.createTask(any(Task.class))).thenReturn(createdTask);

        // When & Then
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newTask)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("New Task")))
                .andExpect(jsonPath("$.description", is("New Description")))
                .andExpect(jsonPath("$.status", is("TODO")))
                .andExpect(jsonPath("$.category", is("Personal")));

        verify(taskService, times(1)).createTask(any(Task.class));
    }

    @Test
    @DisplayName("POST /api/tasks - Should return 400 when title is blank")
    void createTask_WithBlankTitle_ShouldReturn400() throws Exception {
        // Given
        Task invalidTask = new Task();
        invalidTask.setTitle("");
        invalidTask.setStatus(TaskStatus.TODO);

        // When & Then
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidTask)))
                .andExpect(status().isBadRequest());

        verify(taskService, never()).createTask(any(Task.class));
    }

    @Test
    @DisplayName("POST /api/tasks - Should return 400 when title exceeds 100 characters")
    void createTask_WithTitleTooLong_ShouldReturn400() throws Exception {
        // Given
        Task invalidTask = new Task();
        invalidTask.setTitle("a".repeat(101));
        invalidTask.setStatus(TaskStatus.TODO);

        // When & Then
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidTask)))
                .andExpect(status().isBadRequest());

        verify(taskService, never()).createTask(any(Task.class));
    }

    @Test
    @DisplayName("POST /api/tasks - Should return 400 when description exceeds 500 characters")
    void createTask_WithDescriptionTooLong_ShouldReturn400() throws Exception {
        // Given
        Task invalidTask = new Task();
        invalidTask.setTitle("Valid Title");
        invalidTask.setDescription("a".repeat(501));
        invalidTask.setStatus(TaskStatus.TODO);

        // When & Then
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidTask)))
                .andExpect(status().isBadRequest());

        verify(taskService, never()).createTask(any(Task.class));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} - Should update task when found")
    void updateTask_WhenTaskExists_ShouldUpdateAndReturn200() throws Exception {
        // Given
        Task updatedTask = new Task();
        updatedTask.setId(1L);
        updatedTask.setTitle("Updated Task");
        updatedTask.setDescription("Updated Description");
        updatedTask.setStatus(TaskStatus.DONE);
        updatedTask.setCategory("Personal");
        updatedTask.setDueDate(LocalDate.of(2025, 1, 15));

        when(taskService.updateTask(eq(1L), any(Task.class))).thenReturn(updatedTask);

        // When & Then
        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedTask)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(1)))
                .andExpect(jsonPath("$.title", is("Updated Task")))
                .andExpect(jsonPath("$.description", is("Updated Description")))
                .andExpect(jsonPath("$.status", is("DONE")))
                .andExpect(jsonPath("$.category", is("Personal")))
                .andExpect(jsonPath("$.dueDate", is("2025-01-15")));

        verify(taskService, times(1)).updateTask(eq(1L), any(Task.class));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} - Should return 404 when task not found")
    void updateTask_WhenTaskNotFound_ShouldReturn404() throws Exception {
        // Given
        Task updateData = new Task();
        updateData.setTitle("Updated Task");
        updateData.setStatus(TaskStatus.DONE);

        when(taskService.updateTask(eq(999L), any(Task.class)))
                .thenThrow(new RuntimeException("Task not found"));

        // When & Then
        mockMvc.perform(put("/api/tasks/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isNotFound());

        verify(taskService, times(1)).updateTask(eq(999L), any(Task.class));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} - Should return 400 when validation fails")
    void updateTask_WithInvalidData_ShouldReturn400() throws Exception {
        // Given
        Task invalidTask = new Task();
        invalidTask.setTitle("");
        invalidTask.setStatus(TaskStatus.TODO);

        // When & Then
        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidTask)))
                .andExpect(status().isBadRequest());

        verify(taskService, never()).updateTask(eq(1L), any(Task.class));
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} - Should delete task and return 204")
    void deleteTask_WhenTaskExists_ShouldDeleteAndReturn204() throws Exception {
        // Given
        doNothing().when(taskService).deleteTask(1L);

        // When & Then
        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());

        verify(taskService, times(1)).deleteTask(1L);
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} - Should return 404 when task not found")
    void deleteTask_WhenTaskNotFound_ShouldReturn404() throws Exception {
        // Given
        doThrow(new RuntimeException("Task not found")).when(taskService).deleteTask(999L);

        // When & Then
        mockMvc.perform(delete("/api/tasks/999"))
                .andExpect(status().isNotFound());

        verify(taskService, times(1)).deleteTask(999L);
    }
}
