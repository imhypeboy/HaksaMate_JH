package com.mega.haksamate.service;

import com.mega.haksamate.entity.Item;
import com.mega.haksamate.entity.ItemTransaction;
import com.mega.haksamate.entity.Profile;
import com.mega.haksamate.repository.ItemRepository;
import com.mega.haksamate.repository.ItemTransactionRepository;
import com.mega.haksamate.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ItemTransactionService {

    private final ItemTransactionRepository itemTransactionRepository;
    private final ItemRepository itemRepository;
    private final ProfileRepository profileRepository;

    public ItemTransaction createTransaction(UUID buyerId, UUID sellerId, Long itemId) {
        Profile buyer = profileRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("구매자 정보가 없습니다."));
        Profile seller = profileRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("판매자 정보가 없습니다."));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("상품 정보를 찾을 수 없습니다."));

        ItemTransaction transaction = ItemTransaction.builder()
                .item(item)
                .profile(buyer) // 구매자
                .distinctSeller(seller.getId()) // 판매자 ID 문자열
                .comment("")
                .build();

        return itemTransactionRepository.save(transaction);
    }
}
