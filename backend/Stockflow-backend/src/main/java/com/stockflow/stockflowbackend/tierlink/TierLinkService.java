package com.stockflow.stockflowbackend.tierlink;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.*;
import com.stockflow.stockflowbackend.subscription.PlanCatalog;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TierLinkService {

    private final TierLinkRepository tierLinkRepository;
    private final BusinessRepository businessRepository;

    public TierLinkService(TierLinkRepository tierLinkRepository,
            BusinessRepository businessRepository) {
        this.tierLinkRepository = tierLinkRepository;
        this.businessRepository = businessRepository;
    }

    @Transactional
    public TierLink sendRequest(LinkRequest req, Long requesterId) {
        Business requester = businessRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        Business partner = businessRepository
                .findById(req.getPartnerBusinessId())
                .orElseThrow(() -> new RuntimeException("Partner not found"));

        if (!PlanCatalog.isAllowedLink(requester.getTierType(), partner.getTierType())) {
            throw new RuntimeException(requester.getTierType()
                    + " businesses cannot link directly with " + partner.getTierType()
                    + " businesses");
        }

        tierLinkRepository
                .findByRequesterBusinessIdAndPartnerBusinessId(
                        requesterId, req.getPartnerBusinessId())
                .ifPresent(l -> { throw new RuntimeException(
                        "Link request already exists"); });

        TierLink link = new TierLink();
        link.setRequesterBusiness(requester);
        link.setPartnerBusiness(partner);
        link.setStatus("PENDING");
        return tierLinkRepository.save(link);
    }

    @Transactional
    public TierLink acceptRequest(AcceptLinkRequest req, Long callerBusinessId) {
        TierLink link = tierLinkRepository.findById(req.getLinkId())
                .orElseThrow(() -> new RuntimeException("Link not found"));
        if (!callerBusinessId.equals(link.getPartnerBusiness().getId())) {
            throw new RuntimeException("Unauthorized: this link request does not belong to your business");
        }
        link.setStatus("ACTIVE");
        link.setAcceptedAt(LocalDateTime.now());
        return tierLinkRepository.save(link);
    }

    @Transactional(readOnly = true)
    public List<TierLink> getPartners(Long businessId) {
        List<TierLink> all = new ArrayList<>();
        all.addAll(tierLinkRepository
                .findByRequesterBusinessIdAndStatus(businessId, "ACTIVE"));
        all.addAll(tierLinkRepository
                .findByPartnerBusinessIdAndStatus(businessId, "ACTIVE"));
        return all;
    }
}