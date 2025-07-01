package com.mega.haksamate.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class LocationUpdateRequestDTO {
    private UUID userId;
    private double latitude;
    private double longitude;
    private boolean isVisible; // 위치 공개 여부
}
