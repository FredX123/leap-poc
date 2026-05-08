package com.leappoc.report.service.lcr;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leappoc.report.mapper.LcrReportMapper;
import com.leappoc.report.model.lcr.LcrCalculatedData;
import com.leappoc.report.model.lcr.LcrReferenceData;
import com.leappoc.report.model.lcr.LcrReportData;
import com.leappoc.report.repository.lcr.LcrCalculatedDataRepository;
import com.leappoc.report.repository.lcr.LcrReferenceDataRepository;
import com.leappoc.report.repository.lcr.LcrReportDataRepository;
import com.leappoc.shared.dto.lcr.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
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
    private final ObjectMapper objectMapper;
    private final LcrReportMapper mapper;

    public LcrReportService(LcrReportDataRepository repository,
                            LcrCalculatedDataRepository calculatedDataRepository,
                            LcrReferenceDataRepository referenceDataRepository,
                            ObjectMapper objectMapper,
                            LcrReportMapper mapper) {
        this.repository = repository;
        this.calculatedDataRepository = calculatedDataRepository;
        this.referenceDataRepository = referenceDataRepository;
        this.objectMapper = objectMapper;
        this.mapper = mapper;
    }

    /**
     * Retrieves the OSFI LCR report (calculatedData + referenceData) for the given calc ID.
     */
    @Transactional(readOnly = true)
    public OsfiLcrReportDto getOsfiLcrReport(Integer calcId) {
        List<LcrCalculatedData> calcData = calculatedDataRepository.findByCalcIdWithDependencies(calcId);
        List<LcrReferenceData> refData = referenceDataRepository.findByCalcIdOrderByReportingRowAsc(calcId);

        if (calcData.isEmpty() && refData.isEmpty()) {
            log.info("No OSFI LCR data found in DB for calcId={}; loading fallback from classpath:{}", calcId, FALLBACK_LCR);
            return loadOsfiLcrFallback();
        }

        return mapper.toOsfiLcrReport(calcData, refData);
    }

    /**
     * Retrieves the OSFI LCR Metric report data for the specified segment and date range.
     */
    @Transactional(readOnly = true)
    public List<OsfiLcrMetricReportDto> getOsfiLcrMetricReport(
            String segment, LocalDate startDate, LocalDate endDate) {
        List<LcrReportData> data = repository.findByReportCodeAndSegmentAndDateRange(
                REPORT_CODE_LCR_METRIC, segment, startDate, endDate);
        List<OsfiLcrMetricReportDto> result = mapper.toLcrMetricReport(data);
        if (result.isEmpty()) {
            log.info("No LCR-Metric data found in DB for segment={} [{} - {}]; loading fallback from classpath:{}", segment, startDate, endDate, FALLBACK_LCR_METRIC);
            result = loadFallback(FALLBACK_LCR_METRIC, new TypeReference<>() {});
        }
        return result;
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
}
