package com.leappoc.report.service.lcr;

import com.leappoc.report.model.lcr.LcrCalcAdjustment;
import com.leappoc.report.model.lcr.LcrReportData;
import com.leappoc.report.model.lcr.LcrReportLine;
import com.leappoc.report.repository.lcr.LcrCalcAdjustmentRepository;
import com.leappoc.report.repository.lcr.LcrReportDataRepository;
import com.leappoc.report.repository.lcr.LcrReportLineRepository;
import com.leappoc.shared.dto.lcr.LcrCalcAdjustmentRequest;
import com.leappoc.shared.dto.lcr.LcrCalcLineDto;
import com.leappoc.shared.dto.lcr.LcrCalcReportDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class LcrCalcReportService {

    private static final String REPORT_CODE_LCR_CALC = "LCR_CALC";

    private final LcrReportLineRepository lineRepository;
    private final LcrReportDataRepository dataRepository;
    private final LcrCalcAdjustmentRepository adjustmentRepository;

    public LcrCalcReportService(LcrReportLineRepository lineRepository,
                                LcrReportDataRepository dataRepository,
                                LcrCalcAdjustmentRepository adjustmentRepository) {
        this.lineRepository = lineRepository;
        this.dataRepository = dataRepository;
        this.adjustmentRepository = adjustmentRepository;
    }

    @Transactional(readOnly = true)
    public LcrCalcReportDto getReport(Integer calcId, String currency, LocalDate reportingDate) {
        List<LcrReportLine> allLines = lineRepository.findByReportCodeOrderByDisplayOrderAsc(REPORT_CODE_LCR_CALC);
        List<LcrReportData> dataList = dataRepository.findByCalcIdAndCurrencyAndDate(calcId, currency, reportingDate);
        List<LcrCalcAdjustment> adjustments = adjustmentRepository.findByCalcIdAndCurrency(calcId, currency);
        List<String> currencies = dataRepository.findDistinctCurrenciesByCalcId(calcId);

        // Index data by report line ID
        Map<Long, LcrReportData> dataByLineId = dataList.stream()
                .collect(Collectors.toMap(d -> d.getReportLine().getId(), Function.identity(), (a, b) -> a));

        // Index adjustments by line ID
        Map<Long, LcrCalcAdjustment> adjByLineId = adjustments.stream()
                .collect(Collectors.toMap(a -> a.getLine().getId(), Function.identity(), (a, b) -> a));

        List<LcrCalcLineDto> lineDtos = new ArrayList<>();
        for (LcrReportLine line : allLines) {
            LcrCalcLineDto dto = new LcrCalcLineDto();
            dto.setId(line.getId());
            // For non-data lines, lineCode is null (stored with 'H' prefix in DB for uniqueness)
            String lineCode = line.getReportLineCode();
            dto.setLineCode(lineCode != null && !lineCode.startsWith("H") ? lineCode : null);
            dto.setLineName(line.getReportLineName());
            dto.setSectionCode(line.getParaCode());
            // Section/subsection names from levels
            if (line.getLevels() != null && !line.getLevels().isEmpty()) {
                dto.setSectionName(line.getLevels().get(0).getLevelDesc());
                dto.setSectionCode(line.getLevels().get(0).getLevelCode());
                if (line.getLevels().size() > 1) {
                    dto.setSubsectionCode(line.getLevels().get(1).getLevelCode());
                    dto.setSubsectionName(line.getLevels().get(1).getLevelDesc());
                }
            }
            dto.setWeight(line.getWeight());
            dto.setWeightedLineCode(line.getWeightedLineCode());
            dto.setLineType(line.getLineType());
            dto.setDisplayOrder(line.getDisplayOrder());

            LcrReportData data = dataByLineId.get(line.getId());
            if (data != null) {
                dto.setMarketValue(data.getMarketValue());
                dto.setWeightedAmount(data.getWeightedAmount());
            }

            LcrCalcAdjustment adj = adjByLineId.get(line.getId());
            if (adj != null) {
                dto.setAdjustmentValue(adj.getAdjustmentValue());
                dto.setAdjustmentComment(adj.getComment());
            }

            lineDtos.add(dto);
        }

        LcrCalcReportDto report = new LcrCalcReportDto();
        report.setCalcId(calcId);
        report.setReportingDate(reportingDate.toString());
        report.setCurrency(currency);
        report.setAvailableCurrencies(currencies);
        report.setLines(lineDtos);
        return report;
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
