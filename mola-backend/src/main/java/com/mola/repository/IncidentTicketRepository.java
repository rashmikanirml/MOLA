package com.mola.repository;

import com.mola.entity.IncidentTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentTicketRepository extends JpaRepository<IncidentTicket, Long> {
    List<IncidentTicket> findByCreatedBy(String createdBy);
}
