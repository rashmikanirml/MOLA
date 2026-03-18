package com.mola.repository;

import com.mola.entity.Resource;
import com.mola.entity.ResourceStatus;
import com.mola.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
	List<Resource> findByType(ResourceType type);

	List<Resource> findByStatus(ResourceStatus status);

	List<Resource> findByLocationContainingIgnoreCase(String location);
}