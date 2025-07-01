package com.mega.haksamate.service;

import com.mega.haksamate.dto.LocationShareDTO;
import com.mega.haksamate.dto.LocationUpdateRequestDTO;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ProfileRepository profileRepository;

    // 메모리에 현재 위치 정보 저장 (실제로는 Redis 사용 권장)
    private final Map<UUID, LocationShareDTO> activeLocations = new ConcurrentHashMap<>();

    public void updateUserLocation(LocationUpdateRequestDTO request) {
        Profile user = profileRepository.findById(request.getUserId())
                .orElse(null);

        if (user == null) {
            System.err.println("❌ 사용자를 찾을 수 없습니다: " + request.getUserId());
            return;
        }

        LocationShareDTO locationData = new LocationShareDTO(
                request.getUserId(),
                user.getName(),
                request.getLatitude(),
                request.getLongitude(),
                LocalDateTime.now(),
                "online",
                request.isVisible()
        );

        // 위치 정보 저장
        activeLocations.put(request.getUserId(), locationData);

        // 위치 공개 설정인 경우에만 브로드캐스트
        if (request.isVisible()) {
            messagingTemplate.convertAndSend("/topic/location/nearby", locationData);
            System.out.println("📡 위치 정보 브로드캐스트: " + user.getName());
        }
    }

    public void joinLocationSharing(LocationUpdateRequestDTO request) {
        updateUserLocation(request);

        // 현재 활성 사용자들의 위치 정보 전송
        activeLocations.values().stream()
                .filter(LocationShareDTO::isVisible)
                .filter(loc -> !loc.getUserId().equals(request.getUserId()))
                .forEach(loc -> {
                    messagingTemplate.convertAndSendToUser(
                            request.getUserId().toString(),
                            "/queue/location/initial",
                            loc
                    );
                });
    }

    public void leaveLocationSharing(UUID userId) {
        LocationShareDTO removedLocation = activeLocations.remove(userId);

        if (removedLocation != null) {
            // 오프라인 상태로 브로드캐스트
            removedLocation.setStatus("offline");
            messagingTemplate.convertAndSend("/topic/location/nearby", removedLocation);
            System.out.println("👋 사용자 위치 공유 종료: " + removedLocation.getUserName());
        }
    }

    // 근처 사용자 조회 (반경 1km 내)
    public void getNearbyUsers(UUID userId, double latitude, double longitude) {
        activeLocations.values().stream()
                .filter(LocationShareDTO::isVisible)
                .filter(loc -> !loc.getUserId().equals(userId))
                .filter(loc -> calculateDistance(latitude, longitude, loc.getLatitude(), loc.getLongitude()) <= 1.0)
                .forEach(loc -> {
                    messagingTemplate.convertAndSendToUser(
                            userId.toString(),
                            "/queue/location/nearby",
                            loc
                    );
                });
    }

    // 두 지점 간 거리 계산 (km)
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // 지구 반지름 (km)

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}
