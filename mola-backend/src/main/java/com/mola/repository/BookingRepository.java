package com.mola.repository;

import com.mola.entity.Booking;
import com.mola.entity.BookingStatus;
import com.mola.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Check overlapping bookings for same resource
    List<Booking> findByResourceAndStartTimeLessThanAndEndTimeGreaterThan(
            Resource resource,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

        List<Booking> findByResourceAndIdNotAndStartTimeLessThanAndEndTimeGreaterThan(
            Resource resource,
            Long id,
            LocalDateTime endTime,
            LocalDateTime startTime
        );

        List<Booking> findByResourceId(Long resourceId);

        long countByStatus(BookingStatus status);
}