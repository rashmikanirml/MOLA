package com.mola.controller;

import com.mola.entity.Resource;
import com.mola.entity.ResourceStatus;
import com.mola.entity.ResourceType;
import com.mola.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    /**
     * Create a new resource
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource savedResource = resourceService.create(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedResource);
    }

    /**
     * Get all resources
     */
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status
    ) {
        if (type == null && minCapacity == null && (location == null || location.isBlank()) && status == null) {
            return ResponseEntity.ok(resourceService.getAll());
        }

        return ResponseEntity.ok(resourceService.search(type, minCapacity, location, status));
    }

    /**
     * Get resource by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getById(id));
    }

    /**
     * Update resource by ID
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id,
                                                   @Valid @RequestBody Resource resource) {
        Resource updatedResource = resourceService.update(id, resource);
        return ResponseEntity.ok(updatedResource);
    }

    /**
     * Delete resource by ID
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}