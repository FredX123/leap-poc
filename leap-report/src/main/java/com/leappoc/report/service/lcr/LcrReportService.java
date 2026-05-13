package com.leappoc.report.service.lcr;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leappoc.report.mapper.LcrReportMapper;
import com.leappoc.report.model.lcr.*;
import com.leappoc.report.repository.lcr.*;
import com.leappoc.shared.dto.lcr.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class LcrReportService {

    private static final Logger log = LoggerFactory.getLogger(LcrReportService.class);

    private static final String REPORT_CODE_LCR_METRIC = "OSFI_LCR_METRIC";
    private static final String FALLBACK_LCR_METRIC = "data/osfi-lcr-metric.json";
    private static final String FALLBACK_LCR = "data/osfi-lcr.json";

    private final LcrReportDataRepository repository;
    private final LcrCalculatedDataRepository calculatedDataRepository;
    private final LcrReferenceDataRepository referenceDataRepository;
    private final LcrReportLineRepository reportLineRepository;
    private final OsfiLcrAdjustmentRepository adjustmentRepository;
    private final ObjectMapper objectMapper;
    private final LcrReportMapper mapper;

    public LcrReportService(LcrReportDataRepository repository,
                            LcrCalculatedDataRepository calculatedDataRepository,
                            LcrReferenceDataRepository referenceDataRepository,
                            LcrReportLineRepository reportLineRepository,
                            OsfiLcrAdjustmentRepository adjustmentRepository,
                            ObjectMapper objectMapper,
                            LcrReportMapper mapper) {
        this.repository = repository;
        this.calculatedDataRepository = calculatedDataRepository;
        this.referenceDataRepository = referenceDataRepository;
        this.reportLineRepository = reportLineRepository;
        this.adjustmentRepository = adjustmentRepository;
        this.objectMapper = objectMapper;
        this.mapper = mapper;
    }

    /**
     * Retrieves the OSFI LCR report (calculatedData + referenceData + adjustments) for the given calc ID and currency.
     */
    @Transactional(readOnly = true)
    public OsfiLcrReportDto getOsfiLcrReport(Integer calcId, String currency) {

        OsfiLcrReportDto report = loadOsfiLcrFallback();

//        List<LcrCalculatedData> calcData = calculatedDataRepository.findByCalcIdWithDependencies(calcId);
//        List<LcrReferenceData> refData = referenceDataRepository.findByCalcIdOrderByReportingRowAsc(calcId);
//
//        OsfiLcrReportDto report;
//        if (calcData.isEmpty() && refData.isEmpty()) {
//            log.info("No OSFI LCR data found in DB for calcId={}; loading fallback from classpath:{}", calcId, FALLBACK_LCR);
//            report = loadOsfiLcrFallback();
//        } else {
//            report = mapper.toOsfiLcrReport(calcData, refData);
//        }
//
//        // Always load structured report line definitions
//        List<LcrReportLine> lines = reportLineRepository
//                .findByReportCodeAndLineTypeIsNotNullAndDisplayOrderIsNotNullOrderByDisplayOrderAsc("OSFI_LCR");
//        report.setLines(mapper.toReportLineDtos(lines));

        // Load all adjustments for this calcId + currency
        if (report != null && !CollectionUtils.isEmpty(report.getCalculatedData())
                && currency != null && !currency.isBlank()) {
            List<OsfiLcrAdjustment> adjustments = adjustmentRepository.findByCalcIdAndCurrency(calcId, currency);
            List<OsfiLcrAdjustmentDto> adjDtos = new ArrayList<>();
            for (OsfiLcrAdjustment adj : adjustments) {
                adjDtos.add(toAdjustmentDto(adj));
            }
            report.setAdjustments(adjDtos);
        } else {
            report.setAdjustments(Collections.emptyList());
        }

        return report;
    }

    /**
     * Retrieves the OSFI LCR Metric report data for the specified segment and date range.
     */
    @Transactional(readOnly = true)
    public List<OsfiLcrMetricReportDto> getOsfiLcrMetricReport(
            String segment, LocalDate startDate, LocalDate endDate) {

        return loadFallback(FALLBACK_LCR_METRIC, new TypeReference<>() {});

/*        List<LcrReportData> data = repository.findByReportCodeAndSegmentAndDateRange(
                REPORT_CODE_LCR_METRIC, segment, startDate, endDate);
        List<OsfiLcrMetricReportDto> result = mapper.toLcrMetricReport(data);
        if (result.isEmpty()) {
            log.info("No LCR-Metric data found in DB for segment={} [{} - {}]; loading fallback from classpath:{}", segment, startDate, endDate, FALLBACK_LCR_METRIC);
            result = loadFallback(FALLBACK_LCR_METRIC, new TypeReference<>() {});
        }
        return result;*/
    }

    private OsfiLcrReportDto loadOsfiLcrFallback() {
        try (InputStream is = new ClassPathResource(FALLBACK_LCR).getInputStream()) {
            return objectMapper.readValue(is, OsfiLcrReportDto.class);
        } catch (IOException e) {
            log.error("Failed to load OSFI LCR fallback data — returning empty report. Cause: {}", e.getMessage());
            OsfiLcrReportDto empty = new OsfiLcrReportDto();
            empty.setCalculatedData(Collections.emptyList());
            empty.setReferenceData(Collections.emptyList());
            return empty;
        }
    }

    /**
     * Loads fallback data from a specified classpath resource and maps it to a list of a specified type.
     */
    private <T> List<T> loadFallback(String classpathLocation, TypeReference<List<T>> typeRef) {
        try (InputStream is = new ClassPathResource(classpathLocation).getInputStream()) {
            return objectMapper.readValue(is, typeRef);
        } catch (IOException e) {
            log.error("Failed to load fallback data from classpath:{} — returning empty list. Cause: {}", classpathLocation, e.getMessage());
            return Collections.emptyList();
        }
    }

    // --- Adjustment operations ---

    @Transactional(readOnly = true)
    public OsfiLcrAdjustmentDto getAdjustment(Integer calcId, String lineCode, String currency) {
        return adjustmentRepository.findByCalcIdAndLineCodeAndReportableCurrency(calcId, lineCode, currency)
                .map(this::toAdjustmentDto)
                .orElse(null);
    }

    @Transactional
    public void saveAdjustment(OsfiLcrAdjustmentRequest request, String currentUserId) {
        Optional<OsfiLcrAdjustment> existing = adjustmentRepository
                .findByCalcIdAndLineCodeAndReportableCurrency(
                        request.getCalcId(), request.getLineCode(), request.getCurrency());

        OsfiLcrAdjustment adj;
        if (existing.isPresent()) {
            adj = existing.get();
            adj.setAdjustmentValue(request.getAdjustmentValue());
            adj.setComment(request.getComment());
            adj.setUpdatedBy(currentUserId);
            adj.setUpdatedAt(LocalDateTime.now());
        } else {
            adj = new OsfiLcrAdjustment();
            adj.setCalcId(request.getCalcId());
            adj.setLineCode(request.getLineCode());
            adj.setReportableCurrency(request.getCurrency());
            adj.setAdjustmentValue(request.getAdjustmentValue());
            adj.setComment(request.getComment());
            adj.setCreatedBy(currentUserId);
            adj.setCreatedAt(LocalDateTime.now());
        }
        adjustmentRepository.save(adj);
    }

    @Transactional
    public void deleteAdjustment(Integer calcId, String lineCode, String currency) {
        adjustmentRepository.findByCalcIdAndLineCodeAndReportableCurrency(calcId, lineCode, currency)
                .ifPresent(adjustmentRepository::delete);
    }

    private OsfiLcrAdjustmentDto toAdjustmentDto(OsfiLcrAdjustment entity) {
        OsfiLcrAdjustmentDto dto = new OsfiLcrAdjustmentDto();
        dto.setId(entity.getId());
        dto.setCalcId(entity.getCalcId());
        dto.setLineCode(entity.getLineCode());
        dto.setCurrency(entity.getReportableCurrency());
        dto.setAdjustmentValue(entity.getAdjustmentValue());
        dto.setComment(entity.getComment());
        return dto;
    }
}
