package com.mola.service;

import com.mola.entity.Resource;
import com.mola.exception.ResourceNotFoundException;
import com.mola.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository repository;

    public Resource create(Resource resource) {
        return repository.save(resource);
    }

    public List<Resource> getAll() {
        return repository.findAll();
    }

    public Resource getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public Resource update(Long id, Resource updated) {

        Resource existing = getById(id);

        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setCapacity(updated.getCapacity());
        existing.setLocation(updated.getLocation());
        existing.setAvailabilityStart(updated.getAvailabilityStart());
        existing.setAvailabilityEnd(updated.getAvailabilityEnd());
        existing.setStatus(updated.getStatus());

        return repository.save(existing);
    }

    public void delete(Long id) {
        Resource existing = getById(id);
        repository.delete(existing);
    }
}