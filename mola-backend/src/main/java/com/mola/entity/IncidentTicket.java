package com.mola.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incident_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @NotBlank
    private String location;

    @NotBlank
    private String category;

    @NotBlank
    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @NotBlank
    private String preferredContact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status;

    @Column(nullable = false)
    private String createdBy;

    private String assignedTo;

    @Column(length = 2000)
    private String resolutionNotes;

    @Column(length = 1000)
    private String rejectionReason;

    @ElementCollection
    @CollectionTable(name = "incident_ticket_attachments", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "attachment_url")
    @Builder.Default
    private List<String> attachments = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
