package com.mola.controller;

import com.mola.entity.Booking;
import com.mola.entity.BookingStatus;
import com.mola.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Create booking (USER)
    @PostMapping("/{resourceId}")
    public ResponseEntity<Booking> createBooking(
            @PathVariable Long resourceId,
            @Valid @RequestBody Booking booking) {

        Booking created = bookingService.createBooking(resourceId, booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Get all bookings (Authenticated users)
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // Update booking status (ADMIN ONLY)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status) {

        Booking updated = bookingService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}