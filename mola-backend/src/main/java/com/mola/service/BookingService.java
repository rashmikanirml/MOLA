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

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;

    public Booking createBooking(Long resourceId, Booking booking) {

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

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found with id: " + bookingId)
                );
    }

    public List<Booking> getBookingsByResource(Long resourceId) {
        return bookingRepository.findByResourceId(resourceId);
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

    public Booking updateStatus(Long bookingId, BookingStatus newStatus) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found with id: " + bookingId)
                );

        // Workflow validation
        if (booking.getStatus() == BookingStatus.PENDING &&
                (newStatus == BookingStatus.APPROVED || newStatus == BookingStatus.REJECTED)) {

            booking.setStatus(newStatus);

        } else if (booking.getStatus() == BookingStatus.APPROVED &&
                newStatus == BookingStatus.CANCELLED) {

            booking.setStatus(newStatus);

        } else {
            throw new IllegalArgumentException("Invalid booking status transition");
        }

        return bookingRepository.save(booking);
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