package com.mola.service;

import com.mola.entity.*;
import com.mola.exception.BookingConflictException;
import com.mola.exception.ResourceNotFoundException;
import com.mola.repository.BookingRepository;
import com.mola.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

        // 2️⃣ Validate time range
        if (booking.getStartTime().isAfter(booking.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // 3️⃣ Check for overlapping bookings
        List<Booking> conflicts =
                bookingRepository.findByResourceAndStartTimeLessThanAndEndTimeGreaterThan(
                        resource,
                        booking.getEndTime(),
                        booking.getStartTime()
                );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException(
                    "Booking conflict detected for this time slot"
            );
        }

        // 4️⃣ Set relationship & default status
        booking.setResource(resource);
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
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
}