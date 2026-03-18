package com.mola.controller;

import com.mola.entity.IncidentTicket;
import com.mola.entity.TicketComment;
import com.mola.entity.TicketStatus;
import com.mola.service.IncidentTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class IncidentTicketController {

    private final IncidentTicketService incidentTicketService;

    @PostMapping
    public ResponseEntity<IncidentTicket> create(@Valid @RequestBody IncidentTicket ticket,
                                                 Authentication authentication) {
        IncidentTicket created = incidentTicketService.create(ticket, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<IncidentTicket>> list(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long resourceId,
            Authentication authentication) {

        String role = authentication.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(incidentTicketService.list(role, authentication.getName(), status, category, resourceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getById(@PathVariable Long id, Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(incidentTicketService.getById(id, role, authentication.getName()));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<IncidentTicket> assign(@PathVariable Long id,
                                                  @RequestParam String assignee,
                                                  Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(incidentTicketService.assign(id, assignee, role));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<IncidentTicket> updateStatus(@PathVariable Long id,
                                                        @RequestParam TicketStatus status,
                                                        @RequestParam(required = false) String reason,
                                                        @RequestParam(required = false) String resolutionNotes,
                                                        Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(incidentTicketService.updateStatus(
                id,
                status,
                reason,
                resolutionNotes,
                authentication.getName(),
                role
        ));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<TicketComment>> listComments(@PathVariable Long id, Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(incidentTicketService.listComments(id, role, authentication.getName()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<TicketComment> addComment(@PathVariable Long id,
                                                    @RequestBody Map<String, String> payload,
                                                    Authentication authentication) {
        String content = payload.getOrDefault("content", "").trim();
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Comment content is required");
        }

        TicketComment created = incidentTicketService.addComment(id, content, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<TicketComment> editComment(@PathVariable Long ticketId,
                                                     @PathVariable Long commentId,
                                                     @RequestBody Map<String, String> payload,
                                                     Authentication authentication) {
        String content = payload.getOrDefault("content", "").trim();
        if (content.isEmpty()) {
            throw new IllegalArgumentException("Comment content is required");
        }

        String role = authentication.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(incidentTicketService.editComment(ticketId, commentId, content, authentication.getName(), role));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long ticketId,
                                              @PathVariable Long commentId,
                                              Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        incidentTicketService.deleteComment(ticketId, commentId, authentication.getName(), role);
        return ResponseEntity.noContent().build();
    }
}
