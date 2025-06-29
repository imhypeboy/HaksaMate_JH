package com.mega.haksamate.dto;

import com.mega.haksamate.entity.Item;
import lombok.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponseDTO {
    private Long itemid;
    private String title;
    private String category;
    private String description;
    private int price;
    private String regdate;
    private String meetLocation;
    private UUID sellerId;
    private String sellerName; // ✅ 추가
    private List<String> itemImages;
    private String status;

    public static ItemResponseDTO from(Item item) {
        return ItemResponseDTO.builder()
                .itemid(item.getItemid())
                .title(item.getTitle())
                .category(item.getCategory())
                .description(item.getDescription())
                .price(item.getPrice())
                .regdate(item.getRegdate() + "")
                .meetLocation(item.getMeetLocation())
                .sellerId(item.getSeller().getId())
                .sellerName(item.getSeller().getName()) // ✅ 추가
                .itemImages(item.getItemImages().stream()
                        .map(image -> image.getPhotoPath())
                        .collect(Collectors.toList()))
                .status(String.valueOf(item.getStatus()))
                .build();
    }
}
