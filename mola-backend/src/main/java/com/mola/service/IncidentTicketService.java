package com.mola.service;

import com.mola.entity.*;
import com.mola.exception.ResourceNotFoundException;
import com.mola.repository.IncidentTicketRepository;
import com.mola.repository.ResourceRepository;
import com.mola.repository.TicketCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository incidentTicketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public IncidentTicket create(IncidentTicket ticket, String username) {
        if (ticket.getAttachments() != null && ticket.getAttachments().size() > 3) {
            throw new IllegalArgumentException("A maximum of 3 image attachments is allowed");
        }

        Resource resource = null;
        if (ticket.getResource() != null && ticket.getResource().getId() != null) {
            resource = resourceRepository.findById(ticket.getResource().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + ticket.getResource().getId()));
        }

        ticket.setId(null);
        ticket.setResource(resource);
        ticket.setCreatedBy(username);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setAssignedTo(null);
        ticket.setResolutionNotes(null);
        ticket.setRejectionReason(null);
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        if (ticket.getAttachments() == null) {
            ticket.setAttachments(new ArrayList<>());
        }

        return incidentTicketRepository.save(ticket);
    }

    public List<IncidentTicket> list(String role,
                                     String username,
                                     TicketStatus status,
                                     String category,
                                     Long resourceId) {

        List<IncidentTicket> tickets = "ROLE_ADMIN".equals(role) || "ROLE_TECHNICIAN".equals(role)
                ? incidentTicketRepository.findAll()
                : incidentTicketRepository.findByCreatedBy(username);

        return tickets.stream()
                .filter(item -> status == null || item.getStatus() == status)
                .filter(item -> category == null || category.isBlank() ||
                        (item.getCategory() != null && item.getCategory().equalsIgnoreCase(category)))
                .filter(item -> resourceId == null || (item.getResource() != null && Objects.equals(item.getResource().getId(), resourceId)))
                .collect(Collectors.toList());
    }

    public IncidentTicket getById(Long id, String role, String username) {
        IncidentTicket ticket = incidentTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        if (("ROLE_ADMIN".equals(role) || "ROLE_TECHNICIAN".equals(role)) || ticket.getCreatedBy().equals(username)) {
            return ticket;
        }

        throw new IllegalArgumentException("Access denied for this ticket");
    }

    public IncidentTicket assign(Long id, String assignee, String actorRole) {
        if (!"ROLE_ADMIN".equals(actorRole)) {
            throw new IllegalArgumentException("Only admins can assign tickets");
        }

        IncidentTicket ticket = incidentTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        ticket.setAssignedTo(assignee);
        ticket.setUpdatedAt(LocalDateTime.now());
        IncidentTicket updated = incidentTicketRepository.save(ticket);

        if (assignee != null && !assignee.isBlank()) {
            notificationService.create(
                    assignee,
                    "Ticket assigned",
                    "You have been assigned ticket #" + ticket.getId(),
                    NotificationType.TICKET
            );
        }

        return updated;
    }

    public IncidentTicket updateStatus(Long id,
                                       TicketStatus status,
                                       String reason,
                                       String resolutionNotes,
                                       String actorUsername,
                                       String actorRole) {

        if (!("ROLE_ADMIN".equals(actorRole) || "ROLE_TECHNICIAN".equals(actorRole))) {
            throw new IllegalArgumentException("Only ADMIN or TECHNICIAN can update ticket status");
        }

        IncidentTicket ticket = incidentTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));

        validateTransition(ticket.getStatus(), status);

        if (status == TicketStatus.REJECTED && (reason == null || reason.isBlank())) {
            throw new IllegalArgumentException("A reason is required when rejecting a ticket");
        }

        if (status == TicketStatus.RESOLVED && (resolutionNotes == null || resolutionNotes.isBlank())) {
            throw new IllegalArgumentException("Resolution notes are required when resolving a ticket");
        }

        ticket.setStatus(status);
        if (status == TicketStatus.REJECTED) {
            ticket.setRejectionReason(reason);
        }
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        ticket.setUpdatedAt(LocalDateTime.now());

        IncidentTicket updated = incidentTicketRepository.save(ticket);

        notificationService.create(
                ticket.getCreatedBy(),
                "Ticket status updated",
                "Ticket #" + ticket.getId() + " is now " + ticket.getStatus(),
                NotificationType.TICKET
        );

        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().equals(actorUsername)) {
            notificationService.create(
                    ticket.getAssignedTo(),
                    "Ticket status updated",
                    "Ticket #" + ticket.getId() + " is now " + ticket.getStatus(),
                    NotificationType.TICKET
            );
        }

        return updated;
    }

    public List<TicketComment> listComments(Long ticketId, String role, String username) {
        getById(ticketId, role, username);
        return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public TicketComment addComment(Long ticketId, String content, String username) {
        IncidentTicket ticket = incidentTicketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));

        TicketComment comment = TicketComment.builder()
                .ticket(ticket)
                .authorUsername(username)
                .content(content)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        TicketComment saved = ticketCommentRepository.save(comment);

        if (!ticket.getCreatedBy().equals(username)) {
            notificationService.create(
                    ticket.getCreatedBy(),
                    "New comment on your ticket",
                    "A new comment was added to ticket #" + ticket.getId(),
                    NotificationType.COMMENT
            );
        }

        if (ticket.getAssignedTo() != null && !ticket.getAssignedTo().equals(username)) {
            notificationService.create(
                    ticket.getAssignedTo(),
                    "New comment on assigned ticket",
                    "A new comment was added to ticket #" + ticket.getId(),
                    NotificationType.COMMENT
            );
        }

        return saved;
    }

    public TicketComment editComment(Long ticketId, Long commentId, String content, String username, String role) {
        getById(ticketId, role, username);

        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to the specified ticket");
        }

        if (!(comment.getAuthorUsername().equals(username) || "ROLE_ADMIN".equals(role))) {
            throw new IllegalArgumentException("Only the comment owner or ADMIN can edit this comment");
        }

        comment.setContent(content);
        comment.setUpdatedAt(LocalDateTime.now());
        return ticketCommentRepository.save(comment);
    }

    public void deleteComment(Long ticketId, Long commentId, String username, String role) {
        getById(ticketId, role, username);

        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to the specified ticket");
        }

        if (!(comment.getAuthorUsername().equals(username) || "ROLE_ADMIN".equals(role))) {
            throw new IllegalArgumentException("Only the comment owner or ADMIN can delete this comment");
        }

        ticketCommentRepository.delete(comment);
    }

    private void validateTransition(TicketStatus current, TicketStatus next) {
        if (current == TicketStatus.OPEN && (next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED)) {
            return;
        }

        if (current == TicketStatus.IN_PROGRESS && (next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED)) {
            return;
        }

        if (current == TicketStatus.RESOLVED && next == TicketStatus.CLOSED) {
            return;
        }

        throw new IllegalArgumentException("Invalid ticket status transition");
    }
}
