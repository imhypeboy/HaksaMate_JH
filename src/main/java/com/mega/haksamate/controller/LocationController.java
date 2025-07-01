package com.mega.haksamate.controller;

import com.mega.haksamate.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/location")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping("/nearby")
    public ResponseEntity<Void> getNearbyUsers(
            @RequestParam UUID userId,
            @RequestParam double latitude,
            @RequestParam double longitude
    ) {
        locationService.getNearbyUsers(userId, latitude, longitude);
        return ResponseEntity.ok().build();
    }
}
