package com.mega.haksamate.controller;

import com.mega.haksamate.dto.LocationShareDTO;
import com.mega.haksamate.dto.LocationUpdateRequestDTO;
import com.mega.haksamate.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class LocationSocketController {

    private final LocationService locationService;

    @MessageMapping("/location.update")
    public void updateLocation(@Payload LocationUpdateRequestDTO request) {
        System.out.println("📍 위치 업데이트 요청: " + request);
        locationService.updateUserLocation(request);
    }

    @MessageMapping("/location.join")
    public void joinLocationSharing(@Payload LocationUpdateRequestDTO request) {
        System.out.println("🌍 위치 공유 참여: " + request.getUserId());
        locationService.joinLocationSharing(request);
    }

    @MessageMapping("/location.leave")
    public void leaveLocationSharing(@Payload String userId) {
        System.out.println("🚪 위치 공유 종료: " + userId);
        locationService.leaveLocationSharing(UUID.fromString(userId));
    }
}
