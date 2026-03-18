package com.mola.controller;

import com.mola.entity.Booking;
import com.mola.entity.BookingStatus;
import com.mola.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // Create booking (USER)
    @PostMapping("/{resourceId}")
    public ResponseEntity<Booking> createBooking(
            @PathVariable Long resourceId,
            @Valid @RequestBody Booking booking,
            Authentication authentication) {

        Booking created = bookingService.createBooking(resourceId, booking, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Get all bookings (Authenticated users)
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) BookingStatus status,
            Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(
                bookingService.getBookings(role, authentication.getName(), resourceId, status)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<Booking>> getBookingsByResource(@PathVariable Long resourceId,
                                                                Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        return ResponseEntity.ok(bookingService.getBookingsByResource(role, authentication.getName(), resourceId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getBookingStats() {
        return ResponseEntity.ok(bookingService.getBookingStats());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(
            @PathVariable Long id,
            @RequestParam Long resourceId,
            @Valid @RequestBody Booking booking) {

        Booking updated = bookingService.updateBooking(id, resourceId, booking);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

    // Update booking status (ADMIN ONLY)
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            @RequestParam(required = false) String reason) {

        Booking updated = bookingService.updateStatus(id, status, reason);
        return ResponseEntity.ok(updated);
    }
}