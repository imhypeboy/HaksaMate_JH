package com.mega.haksamate.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "item_transaction")
public class ItemTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_itemid", nullable = false)
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(name = "distinct_seller", nullable = false)
    private UUID distinctSeller;

    @Column(columnDefinition = "TEXT")
    private String comment;
}
