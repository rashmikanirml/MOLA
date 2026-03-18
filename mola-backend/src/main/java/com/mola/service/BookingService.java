package com.mola.service;

import com.mola.entity.*;
import com.mola.exception.BookingConflictException;
import com.mola.exception.ResourceNotFoundException;
import com.mola.repository.BookingRepository;
import com.mola.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public Booking createBooking(Long resourceId, Booking booking, String requestedBy) {

        // 1️⃣ Check resource exists
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource not found with id: " + resourceId)
                );

        validateTimeRange(booking.getStartTime(), booking.getEndTime());
        validateNoConflict(resource, booking.getStartTime(), booking.getEndTime(), null);

        // 4️⃣ Set relationship & default status
        booking.setResource(resource);
        booking.setStatus(BookingStatus.PENDING);
        booking.setRequestedBy(requestedBy);
        booking.setAdminDecisionReason(null);

        Booking saved = bookingRepository.save(booking);
        notificationService.create(
            saved.getRequestedBy(),
            "Booking request created",
            "Your booking request for " + saved.getResource().getName() + " is pending review.",
            NotificationType.BOOKING
        );
        return saved;
    }

    public List<Booking> getBookings(String role,
                                     String username,
                                     Long resourceId,
                                     BookingStatus status) {
        List<Booking> base;

        if ("ROLE_ADMIN".equals(role)) {
            base = resourceId == null ? bookingRepository.findAll() : bookingRepository.findByResourceId(resourceId);
        } else {
            base = resourceId == null
                    ? bookingRepository.findByRequestedBy(username)
                    : bookingRepository.findByRequestedByAndResourceId(username, resourceId);
        }

        if (status == null) {
            return base;
        }

        return base.stream().filter(item -> item.getStatus() == status).collect(Collectors.toList());
    }

    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found with id: " + bookingId)
                );
    }

    public List<Booking> getBookingsByResource(String role, String username, Long resourceId) {
        return getBookings(role, username, resourceId, null);
    }

    public Booking updateBooking(Long bookingId, Long resourceId, Booking updated) {
        Booking existing = getBookingById(bookingId);

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Resource not found with id: " + resourceId)
                );

        validateTimeRange(updated.getStartTime(), updated.getEndTime());
        validateNoConflict(resource, updated.getStartTime(), updated.getEndTime(), bookingId);

        existing.setResource(resource);
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setPurpose(updated.getPurpose());
        existing.setAttendees(updated.getAttendees());

        return bookingRepository.save(existing);
    }

    public void deleteBooking(Long bookingId) {
        Booking existing = getBookingById(bookingId);
        bookingRepository.delete(existing);
    }

    public Map<String, Long> getBookingStats() {
        Map<String, Long> stats = new HashMap<>();
        for (BookingStatus status : BookingStatus.values()) {
            stats.put(status.name(), bookingRepository.countByStatus(status));
        }
        stats.put("TOTAL", bookingRepository.count());
        return stats;
    }

    public Booking updateStatus(Long bookingId, BookingStatus newStatus, String reason) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found with id: " + bookingId)
                );

        // Workflow validation
        if (booking.getStatus() == BookingStatus.PENDING &&
                (newStatus == BookingStatus.APPROVED || newStatus == BookingStatus.REJECTED)) {

            if (newStatus == BookingStatus.REJECTED && (reason == null || reason.isBlank())) {
                throw new IllegalArgumentException("A reason is required when rejecting a booking");
            }

            booking.setStatus(newStatus);
            booking.setAdminDecisionReason(reason);

        } else if (booking.getStatus() == BookingStatus.APPROVED &&
                newStatus == BookingStatus.CANCELLED) {

            booking.setStatus(newStatus);
            booking.setAdminDecisionReason(reason);

        } else {
            throw new IllegalArgumentException("Invalid booking status transition");
        }

        Booking saved = bookingRepository.save(booking);
        notificationService.create(
            saved.getRequestedBy(),
            "Booking status updated",
            "Booking #" + saved.getId() + " is now " + saved.getStatus() +
                (saved.getAdminDecisionReason() != null ? " (" + saved.getAdminDecisionReason() + ")" : ""),
            NotificationType.BOOKING
        );
        return saved;
    }

    private void validateTimeRange(java.time.LocalDateTime startTime,
                                   java.time.LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }

        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private void validateNoConflict(Resource resource,
                                    java.time.LocalDateTime startTime,
                                    java.time.LocalDateTime endTime,
                                    Long excludeBookingId) {
        List<Booking> conflicts;
        if (excludeBookingId == null) {
            conflicts = bookingRepository.findByResourceAndStartTimeLessThanAndEndTimeGreaterThan(
                    resource,
                    endTime,
                    startTime
            );
        } else {
            conflicts = bookingRepository.findByResourceAndIdNotAndStartTimeLessThanAndEndTimeGreaterThan(
                    resource,
                    excludeBookingId,
                    endTime,
                    startTime
            );
        }

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Booking conflict detected for this time slot");
        }
    }
}