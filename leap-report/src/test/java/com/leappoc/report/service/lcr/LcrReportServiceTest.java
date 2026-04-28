package com.leappoc.report.service.lcr;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.leappoc.report.mapper.LcrReportMapper;
import com.leappoc.report.model.lcr.LcrReportData;
import com.leappoc.report.model.lcr.LcrReportLine;
import com.leappoc.report.model.lcr.LcrReportLineLevel;
import com.leappoc.report.model.lcr.LcrSegment;
import com.leappoc.report.repository.lcr.LcrReportDataRepository;
import com.leappoc.shared.dto.lcr.OsfiLcrMetricReportDto;
import com.leappoc.shared.dto.lcr.OsfiLcrReportDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LcrReportServiceTest {

    @Mock
    private LcrReportDataRepository repository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Spy
    private LcrReportMapper mapper = new LcrReportMapper();

    @InjectMocks
    private LcrReportService service;

    private static final LocalDate START = LocalDate.of(2026, 1, 29);
    private static final LocalDate END = LocalDate.of(2026, 1, 30);

    // ------------------------------------------------------------------
    // getOsfiLcrReport
    // ------------------------------------------------------------------

    @Nested
    @DisplayName("getOsfiLcrReport")
    class GetOsfiLcrReport {

        @Test
        @DisplayName("returns mapped DB data when repository has results")
        void returnsDbData() {
            List<LcrReportData> dbData = buildLcrDataList();
            when(repository.findByReportCodeAndDateRange("OSFI_LCR", START, END))
                    .thenReturn(dbData);

            List<OsfiLcrReportDto> result = service.getOsfiLcrReport(START, END);

            assertFalse(result.isEmpty());
            assertEquals(1, result.size());
            assertEquals("OSFI_LCR", result.get(0).getReportCode());
            assertEquals("11001", result.get(0).getReportLineCode());
            verify(repository).findByReportCodeAndDateRange("OSFI_LCR", START, END);
            verify(mapper).toLcrReport(dbData);
        }

        @Test
        @DisplayName("falls back to JSON when repository returns empty")
        void fallbackToJson() {
            when(repository.findByReportCodeAndDateRange("OSFI_LCR", START, END))
                    .thenReturn(Collections.emptyList());

            List<OsfiLcrReportDto> result = service.getOsfiLcrReport(START, END);

            assertFalse(result.isEmpty(), "Should load fallback JSON data");
            verify(repository).findByReportCodeAndDateRange("OSFI_LCR", START, END);
            // Mapper should have been called with empty list (returning empty), triggering fallback
            verify(mapper).toLcrReport(Collections.emptyList());
        }

        @Test
        @DisplayName("calls repository with correct report code")
        void correctReportCode() {
            when(repository.findByReportCodeAndDateRange(anyString(), any(), any()))
                    .thenReturn(Collections.emptyList());

            service.getOsfiLcrReport(START, END);

            verify(repository).findByReportCodeAndDateRange(eq("OSFI_LCR"), eq(START), eq(END));
        }
    }

    // ------------------------------------------------------------------
    // getOsfiLcrMetricReport
    // ------------------------------------------------------------------

    @Nested
    @DisplayName("getOsfiLcrMetricReport")
    class GetOsfiLcrMetricReport {

        @Test
        @DisplayName("returns mapped DB data when repository has results")
        void returnsDbData() {
            List<LcrReportData> dbData = buildMetricDataList();
            when(repository.findByReportCodeAndSegmentAndDateRange("OSFI_LCR_METRIC", "Enterprise", START, END))
                    .thenReturn(dbData);

            List<OsfiLcrMetricReportDto> result = service.getOsfiLcrMetricReport("Enterprise", START, END);

            assertFalse(result.isEmpty());
            assertEquals(1, result.size());
            assertEquals("OSFI_LCR_METRIC", result.get(0).getReportCode());
            assertEquals("11001", result.get(0).getReportLineCode());
            assertNotNull(result.get(0).getSegmentData().get(0).getDateData().get(0).getRwAmountRptCcy());
            verify(repository).findByReportCodeAndSegmentAndDateRange("OSFI_LCR_METRIC", "Enterprise", START, END);
            verify(mapper).toLcrMetricReport(dbData);
        }

        @Test
        @DisplayName("falls back to JSON when repository returns empty")
        void fallbackToJson() {
            when(repository.findByReportCodeAndSegmentAndDateRange(anyString(), anyString(), any(), any()))
                    .thenReturn(Collections.emptyList());

            List<OsfiLcrMetricReportDto> result = service.getOsfiLcrMetricReport("Enterprise", START, END);

            assertFalse(result.isEmpty(), "Should load fallback JSON data");
            verify(mapper).toLcrMetricReport(Collections.emptyList());
        }

        @Test
        @DisplayName("calls repository with correct report code and segment")
        void correctReportCodeAndSegment() {
            when(repository.findByReportCodeAndSegmentAndDateRange(anyString(), anyString(), any(), any()))
                    .thenReturn(Collections.emptyList());

            service.getOsfiLcrMetricReport("CA Retail", START, END);

            verify(repository).findByReportCodeAndSegmentAndDateRange(
                    eq("OSFI_LCR_METRIC"), eq("CA Retail"), eq(START), eq(END));
        }
    }

    // ------------------------------------------------------------------
    // Factory helpers
    // ------------------------------------------------------------------

    private List<LcrReportData> buildLcrDataList() {
        LcrSegment seg = new LcrSegment();
        seg.setId(1L);
        seg.setSegmentOrder(1);
        seg.setSegmentName("Enterprise");

        LcrReportLine line = new LcrReportLine();
        line.setId(1L);
        line.setReportCode("OSFI_LCR");
        line.setParaCode("43(a)");
        line.setReportLineCode("11001");
        line.setReportLineName("Coins and banknotes");

        LcrReportLineLevel lvl1 = new LcrReportLineLevel();
        lvl1.setId(1L);
        lvl1.setReportLine(line);
        lvl1.setLevelOrder(1);
        lvl1.setLevelCode("10");
        lvl1.setLevelDesc("HQLA");
        LcrReportLineLevel lvl2 = new LcrReportLineLevel();
        lvl2.setId(2L);
        lvl2.setReportLine(line);
        lvl2.setLevelOrder(2);
        lvl2.setLevelCode("110");
        lvl2.setLevelDesc("Level 1 assets");
        line.setLevels(List.of(lvl1, lvl2));

        LcrReportData data = new LcrReportData();
        data.setId(1L);
        data.setReportLine(line);
        data.setSegment(seg);
        data.setDateSkey(20260129);
        data.setCalendarDate(LocalDate.of(2026, 1, 29));
        data.setAmountRptCcy(new BigDecimal("6189552440.65"));
        data.setRwAmountRptCcy(null);

        return List.of(data);
    }

    private List<LcrReportData> buildMetricDataList() {
        LcrSegment seg = new LcrSegment();
        seg.setId(1L);
        seg.setSegmentOrder(1);
        seg.setSegmentName("Enterprise");

        LcrReportLine line = new LcrReportLine();
        line.setId(1L);
        line.setReportCode("OSFI_LCR_METRIC");
        line.setParaCode("43(a)");
        line.setReportLineCode("11001");
        line.setReportLineName("Cash & Cash Equivalents");

        LcrReportLineLevel lvl1 = new LcrReportLineLevel();
        lvl1.setId(1L);
        lvl1.setReportLine(line);
        lvl1.setLevelOrder(1);
        lvl1.setLevelCode("10");
        lvl1.setLevelDesc("High Quality Liquid Asset");
        LcrReportLineLevel lvl2 = new LcrReportLineLevel();
        lvl2.setId(2L);
        lvl2.setReportLine(line);
        lvl2.setLevelOrder(2);
        lvl2.setLevelCode("110");
        lvl2.setLevelDesc("Cash & Cash Equivalents");
        line.setLevels(List.of(lvl1, lvl2));

        LcrReportData data = new LcrReportData();
        data.setId(1L);
        data.setReportLine(line);
        data.setSegment(seg);
        data.setDateSkey(20260129);
        data.setCalendarDate(LocalDate.of(2026, 1, 29));
        data.setAmountRptCcy(new BigDecimal("6189552440.65"));
        data.setRwAmountRptCcy(new BigDecimal("6189552440.65"));

        return List.of(data);
    }
}
