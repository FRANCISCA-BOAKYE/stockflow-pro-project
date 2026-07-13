package com.stockflow.stockflowbackend.tierlink;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.*;
import com.stockflow.stockflowbackend.notification.NotificationService;
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
    private final NotificationService notificationService;

    public TierLinkService(TierLinkRepository tierLinkRepository,
            BusinessRepository businessRepository,
            NotificationService notificationService) {
        this.tierLinkRepository = tierLinkRepository;
        this.businessRepository = businessRepository;
        this.notificationService = notificationService;
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
        TierLink saved = tierLinkRepository.save(link);

        notificationService.notify(partner, "TIER_LINK_REQUEST", "info",
                "New link request",
                requester.getName() + " wants to link with your business");

        return saved;
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
        TierLink saved = tierLinkRepository.save(link);

        notificationService.notify(link.getRequesterBusiness(), "TIER_LINK_ACCEPTED", "success",
                "Link request accepted",
                link.getPartnerBusiness().getName() + " accepted your link request");

        return saved;
    }

    @Transactional(readOnly = true)
    public List<TierLink> getPartners(Long businessId) {
        List<TierLink> all = new ArrayList<>();
        all.addAll(tierLinkRepository
                .findByRequesterBusinessIdAndStatus(businessId, "ACTIVE"));
        all.addAll(tierLinkRepository
                .findByPartnerBusinessIdAndStatus(businessId, "ACTIVE"));
        all.addAll(tierLinkRepository
                .findByRequesterBusinessIdAndStatus(businessId, "PENDING"));
        all.addAll(tierLinkRepository
                .findByPartnerBusinessIdAndStatus(businessId, "PENDING"));
        return all;
    }
}