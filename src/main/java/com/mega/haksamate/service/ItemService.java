package com.mega.haksamate.service;

import com.mega.haksamate.dto.ItemRegisterRequestDTO;
import com.mega.haksamate.dto.ItemResponseDTO;
import com.mega.haksamate.dto.ItemSuggestionDTO;
import com.mega.haksamate.entity.*;
import com.mega.haksamate.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {

    private final ItemRepository itemRepository;
    private final ItemImageRepository itemImageRepository;
    private final ProfileRepository profileRepository;

    private final ItemTransactionRepository itemTransactionRepository;
    private final ItemLikeRepository itemLikeRepository;

    @PersistenceContext
    private EntityManager em;

    private final String UPLOAD_DIR = "./frontend/public/uploads";
    private final String THUMBNAIL_DIR = "./frontend/public/uploads/thumbnails";

    public Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
    }

    public ItemResponseDTO getItemResponseById(Long id) {
        Item item = itemRepository.findItemWithSellerAndImagesById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
        return toResponseDTO(item);
    }

    public List<ItemResponseDTO> getAllItems() {
        return itemRepository.findAllWithSellerAndImages().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ItemResponseDTO> getItemsBySellerId(UUID userId) {
        return itemRepository.findBySellerUserIdWithImages(userId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ItemResponseDTO> getItemsBySeller(UUID sellerId) {
        return getItemsBySellerId(sellerId);
    }

    public ItemResponseDTO toResponseDTO(Item item) {
        return ItemResponseDTO.builder()
                .itemid(item.getItemid())
                .title(item.getTitle())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory())
                .meetLocation(item.getMeetLocation())
                .regdate(String.valueOf(item.getRegdate()))
                .sellerId(item.getSeller() != null ? item.getSeller().getId() : null)
                .status(item.getStatus().name())
                .itemImages(item.getItemImages() != null
                        ? item.getItemImages().stream().map(ItemImage::getPhotoPath).toList()
                        : new ArrayList<>())
                .build();
    }

    public Long saveItemWithImages(ItemRegisterRequestDTO requestDTO, List<MultipartFile> images) {
        Profile seller = profileRepository.findById(requestDTO.getSellerId())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        Item item = Item.builder()
                .seller(seller)
                .title(requestDTO.getTitle())
                .description(requestDTO.getDescription())
                .price(requestDTO.getPrice())
                .category(requestDTO.getCategory())
                .status(Item.Status.판매중)
                .meetLocation(requestDTO.getMeetLocation())
                .regdate(System.currentTimeMillis())
                .build();

        saveImages(images, item);

        return itemRepository.save(item).getItemid();
    }

    public void updateItem(Long itemId, ItemRegisterRequestDTO requestDTO, List<MultipartFile> images) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));

        item.setTitle(requestDTO.getTitle());
        item.setDescription(requestDTO.getDescription());
        item.setPrice(requestDTO.getPrice());
        item.setCategory(requestDTO.getCategory());
        item.setMeetLocation(requestDTO.getMeetLocation());

        item.getItemImages().clear();

        saveImages(images, item);
    }

    private void saveImages(List<MultipartFile> images, Item item) {
        if (images == null || images.isEmpty()) return;

        Path uploadPath = Paths.get(UPLOAD_DIR);
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("디렉토리 생성 실패: " + e.getMessage());
        }

        for (MultipartFile file : images) {
            try {
                String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
                String saveFileName = UUID.randomUUID().toString().replace("-", "") + ext;
                Path filePath = uploadPath.resolve(saveFileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                ItemImage image = ItemImage.builder()
                        .photoPath("/uploads/" + saveFileName)
                        .regdate(LocalDateTime.now())
                        .build();
                item.addItemImage(image);
            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 실패: " + e.getMessage());
            }
        }
    }

    public void deleteItem(Long itemId) {
        itemLikeRepository.deleteByItemId(itemId);

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));

        for (ItemImage img : item.getItemImages()) {
            String filename = img.getPhotoPath().substring(img.getPhotoPath().lastIndexOf("/") + 1);

            try {
                Files.deleteIfExists(Paths.get(UPLOAD_DIR, filename));
                Files.deleteIfExists(Paths.get(THUMBNAIL_DIR, "thumb_" + filename));
            } catch (IOException e) {
                System.err.println("❌ 파일 삭제 실패: " + e.getMessage());
            }
        }

        List<ItemTransaction> transactions = itemTransactionRepository.findAllByItem_Itemid(itemId);
        itemTransactionRepository.deleteAll(transactions);
        itemImageRepository.deleteAll(item.getItemImages());
        itemRepository.delete(item);
    }

    public void updateItemStatus(Long itemId, String status) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
        try {
            item.setStatus(Item.Status.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("유효하지 않은 상태 값입니다: " + status);
        }
    }

    public List<ItemResponseDTO> getCompletedItemsByBuyer(UUID buyerId) {
        return itemRepository.findCompletedByBuyerUserId(buyerId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemSuggestionDTO> getItemSuggestionsWithImage(String keyword) {
        return itemRepository.findTop10ByKeyword(keyword).stream()
                .map(item -> new ItemSuggestionDTO(
                        item.getItemid(),
                        item.getTitle(),
                        item.getItemImages() != null && !item.getItemImages().isEmpty()
                                ? item.getItemImages().get(0).getPhotoPath()
                                : null
                )).toList();
    }
}
