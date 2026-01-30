package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for Task entity.
 * Spring Data JPA will automatically implement CRUD operations.
 * AI-generated repository interface.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Spring Data JPA auto-implements:
    // - save()
    // - findById()
    // - findAll()
    // - deleteById()
    // - count()
    // and more...
}
