package com.elc.system.modules.finance.service;

import com.elc.system.modules.finance.dto.PromotionDto.PromotionResponse;
import com.elc.system.modules.finance.entity.Promotion;
import com.elc.system.modules.finance.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    @Transactional(readOnly = true)
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        return PromotionResponse.builder()
                .id(promotion.getId())
                .code(promotion.getCode())
                .type(promotion.getType())
                .amount(promotion.getAmount())
                .minPurchase(promotion.getMinPurchase())
                .expiryDate(promotion.getExpiryDate())
                .usageLimit(promotion.getUsageLimit())
                .usageCount(promotion.getUsageCount())
                .isActive(promotion.getIsActive())
                .build();
    }
}
