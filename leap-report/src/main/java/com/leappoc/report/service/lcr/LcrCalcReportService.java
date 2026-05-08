package com.leappoc.report.service.lcr;

import com.leappoc.report.model.lcr.LcrCalcAdjustment;
import com.leappoc.report.repository.lcr.LcrCalcAdjustmentRepository;
import com.leappoc.report.repository.lcr.LcrReportLineRepository;
import com.leappoc.shared.dto.lcr.LcrCalcAdjustmentRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class LcrCalcReportService {

    private final LcrReportLineRepository lineRepository;
    private final LcrCalcAdjustmentRepository adjustmentRepository;

    public LcrCalcReportService(LcrReportLineRepository lineRepository,
                                LcrCalcAdjustmentRepository adjustmentRepository) {
        this.lineRepository = lineRepository;
        this.adjustmentRepository = adjustmentRepository;
    }


    @Transactional
    public void saveAdjustment(LcrCalcAdjustmentRequest request, String currentUserId) {
        Optional<LcrCalcAdjustment> existing = adjustmentRepository
                .findByCalcIdAndLineIdAndReportableCurrency(
                        request.getCalcId(), request.getLineId(), request.getCurrency());

        LcrCalcAdjustment adj;
        if (existing.isPresent()) {
            adj = existing.get();
            adj.setAdjustmentValue(request.getAdjustmentValue());
            adj.setComment(request.getComment());
            adj.setUpdatedBy(currentUserId);
            adj.setUpdatedAt(LocalDateTime.now());
        } else {
            adj = new LcrCalcAdjustment();
            adj.setCalcId(request.getCalcId());
            adj.setLine(lineRepository.getReferenceById(request.getLineId()));
            adj.setReportableCurrency(request.getCurrency());
            adj.setAdjustmentValue(request.getAdjustmentValue());
            adj.setComment(request.getComment());
            adj.setCreatedBy(currentUserId);
            adj.setCreatedAt(LocalDateTime.now());
        }
        adjustmentRepository.save(adj);
    }

    @Transactional
    public void deleteAdjustment(Integer calcId, Long lineId, String currency) {
        adjustmentRepository.findByCalcIdAndLineIdAndReportableCurrency(calcId, lineId, currency)
                .ifPresent(adjustmentRepository::delete);
    }
}
