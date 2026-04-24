package com.leappoc.report.service.lcr;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leappoc.report.mapper.LcrReportMapper;
import com.leappoc.report.model.lcr.LcrReportData;
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

    private static final String REPORT_CODE_LCR = "OSFI_LCR";
    private static final String REPORT_CODE_LCR_METRIC = "OSFI_LCR_METRIC";

    private static final String FALLBACK_LCR = "data/osfi-lcr.json";
    private static final String FALLBACK_LCR_METRIC = "data/osfi-lcr-metric.json";

    private final LcrReportDataRepository repository;
    private final ObjectMapper objectMapper;
    private final LcrReportMapper mapper;

    public LcrReportService(LcrReportDataRepository repository, ObjectMapper objectMapper, LcrReportMapper mapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
        this.mapper = mapper;
    }

    /**
     * Retrieves the OSFI LCR report data for the specified date range. If no data is found
     * in the database for the given range, fallback data is loaded from a predefined
     * classpath resource.
     *
     * @param startDate the start date of the report date range
     * @param endDate the end date of the report date range
     * @return a list of {@code OsfiLcrReportDto} containing the report data for the given date range
     */
    @Transactional(readOnly = true)
    public List<OsfiLcrReportDto> getOsfiLcrReport(LocalDate startDate, LocalDate endDate) {
        List<LcrReportData> data = repository.findByReportCodeAndDateRange(
                REPORT_CODE_LCR, startDate, endDate);
        List<OsfiLcrReportDto> result = mapper.toLcrReport(data);
        if (result.isEmpty()) {
            log.info("No LCR data found in DB for [{} - {}]; loading fallback from classpath:{}", startDate, endDate, FALLBACK_LCR);
            result = loadFallback(FALLBACK_LCR, new TypeReference<>() {});
        }
        return result;
    }

    /**
     * Retrieves the OSFI LCR Metric report data for the specified segment and date range.
     * If no data is found in the database for the given criteria, fallback data is loaded
     * from a predefined classpath resource.
     *
     * @param segment the segment identifier for the report
     * @param startDate the start date of the report date range
     * @param endDate the end date of the report date range
     * @return a list of {@code OsfiLcrMetricReportDto} containing the metric report data
     *         for the given segment and date range
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

    /**
     * Loads fallback data from a specified classpath resource and maps it to a list of a specified type.
     * If an error occurs while reading from the specified location, an empty list is returned and the
     * error is logged.
     *
     * @param <T> the type of elements contained in the resulting list
     * @param classpathLocation the classpath location of the fallback data file
     * @param typeRef the type reference used for deserializing the JSON data to a list of objects
     * @return a list of objects deserialized from the fallback data, or an empty list if an error occurs
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
