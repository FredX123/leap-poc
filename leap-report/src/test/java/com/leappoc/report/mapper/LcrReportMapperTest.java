package com.leappoc.report.mapper;

import com.leappoc.report.model.lcr.LcrReportData;
import com.leappoc.report.model.lcr.LcrReportLine;
import com.leappoc.report.model.lcr.LcrReportLineLevel;
import com.leappoc.report.model.lcr.LcrSegment;
import com.leappoc.shared.dto.lcr.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LcrReportMapperTest {

    private LcrReportMapper mapper;

    // Shared test fixtures
    private LcrSegment segEnterprise;
    private LcrSegment segCaRetail;

    @BeforeEach
    void setUp() {
        mapper = new LcrReportMapper();

        segEnterprise = createSegment(1L, 1, "Enterprise");
        segCaRetail = createSegment(2L, 2, "CA Retail");
    }

    // ------------------------------------------------------------------
    // toLcrReport
    // ------------------------------------------------------------------

    @Nested
    @DisplayName("toLcrReport")
    class ToLcrReport {

        @Test
        @DisplayName("empty list returns empty result")
        void emptyInput() {
            List<OsfiLcrReportDto> result = mapper.toLcrReport(Collections.emptyList());
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("single line, single segment, single date")
        void singleLineSegmentDate() {
            LcrReportLine line = createLine(1L, "OSFI_LCR", "43(a)", "11001", "Coins and banknotes",
                    createLevel(1L, 1, "10", "HQLA"),
                    createLevel(2L, 2, "110", "Level 1 assets"));

            LcrReportData data = createData(1L, line, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("6189552440.65"), null);

            List<OsfiLcrReportDto> result = mapper.toLcrReport(List.of(data));

            assertEquals(1, result.size());
            OsfiLcrReportDto dto = result.get(0);
            assertEquals("OSFI_LCR", dto.getReportCode());
            assertEquals("43(a)", dto.getParaCode());
            assertEquals("11001", dto.getReportLineCode());
            assertEquals("Coins and banknotes", dto.getReportLineName());

            // Levels
            assertEquals(2, dto.getLevels().size());
            assertEquals("10", dto.getLevels().get(0).getLevelCode());
            assertEquals("HQLA", dto.getLevels().get(0).getLevelDesc());
            assertEquals("110", dto.getLevels().get(1).getLevelCode());

            // Segment data
            assertEquals(1, dto.getSegmentData().size());
            OsfiLcrSegmentDataDto seg = dto.getSegmentData().get(0);
            assertEquals("Enterprise", seg.getSegmentName());
            assertEquals(1, seg.getSegmentOrder());
            assertEquals(1, seg.getDateData().size());

            OsfiLcrDateDataDto dd = seg.getDateData().get(0);
            assertEquals(20260129, dd.getDateSkey());
            assertEquals("2026-01-29", dd.getCalendarDate());
            assertEquals(0, new BigDecimal("6189552440.65").compareTo(dd.getAmountRptCcy()));
        }

        @Test
        @DisplayName("single line with multiple segments sorted by segmentOrder")
        void multipleSegmentsSorted() {
            LcrReportLine line = createLine(1L, "OSFI_LCR", "43(a)", "11001", "Coins",
                    createLevel(1L, 1, "10", "HQLA"));

            // Insert CA Retail first (order=2), then Enterprise (order=1) to verify sorting
            LcrReportData d1 = createData(1L, line, segCaRetail, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("100"), null);
            LcrReportData d2 = createData(2L, line, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("200"), null);

            List<OsfiLcrReportDto> result = mapper.toLcrReport(List.of(d1, d2));

            assertEquals(1, result.size());
            List<OsfiLcrSegmentDataDto> segs = result.get(0).getSegmentData();
            assertEquals(2, segs.size());
            assertEquals("Enterprise", segs.get(0).getSegmentName());  // order=1 first
            assertEquals("CA Retail", segs.get(1).getSegmentName());   // order=2 second
        }

        @Test
        @DisplayName("multiple lines produce separate DTOs")
        void multipleLines() {
            LcrReportLine line1 = createLine(1L, "OSFI_LCR", "43(a)", "11001", "Line 1",
                    createLevel(1L, 1, "10", "HQLA"));
            LcrReportLine line2 = createLine(2L, "OSFI_LCR", "43(b)", "11002", "Line 2",
                    createLevel(3L, 1, "10", "HQLA"));

            LcrReportData d1 = createData(1L, line1, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), BigDecimal.ZERO, null);
            LcrReportData d2 = createData(2L, line2, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), BigDecimal.ONE, null);

            List<OsfiLcrReportDto> result = mapper.toLcrReport(List.of(d1, d2));

            assertEquals(2, result.size());
            assertEquals("11001", result.get(0).getReportLineCode());
            assertEquals("11002", result.get(1).getReportLineCode());
        }

        @Test
        @DisplayName("duplicate line codes with different IDs produce separate DTOs")
        void duplicateLineCodesDifferentIds() {
            // Simulates the 22209 case: same line code, different hierarchy / para_code
            LcrReportLine line1 = createLine(1L, "OSFI_LCR", "", "22209", "Demand deposits",
                    createLevel(1L, 1, "10", "HQLA"),
                    createLevel(2L, 2, "150", "Non-operational deposits"));
            LcrReportLine line2 = createLine(2L, "OSFI_LCR", "50", "22209", "Demand deposits",
                    createLevel(3L, 1, "20", "Net cash outflows"),
                    createLevel(4L, 2, "220", "Cash inflows"));

            LcrReportData d1 = createData(1L, line1, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("100"), null);
            LcrReportData d2 = createData(2L, line2, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("200"), null);

            List<OsfiLcrReportDto> result = mapper.toLcrReport(List.of(d1, d2));

            assertEquals(2, result.size(), "Duplicate line codes with different entity IDs must produce separate DTOs");
            // First DTO: paraCode=""
            assertEquals("", result.get(0).getParaCode());
            assertEquals("10", result.get(0).getLevels().get(0).getLevelCode());
            // Second DTO: paraCode="50"
            assertEquals("50", result.get(1).getParaCode());
            assertEquals("20", result.get(1).getLevels().get(0).getLevelCode());
        }

        @Test
        @DisplayName("single line with multiple dates per segment")
        void multipleDatesPerSegment() {
            LcrReportLine line = createLine(1L, "OSFI_LCR", "43(a)", "11001", "Coins",
                    createLevel(1L, 1, "10", "HQLA"));

            LcrReportData d1 = createData(1L, line, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("100"), null);
            LcrReportData d2 = createData(2L, line, segEnterprise, 20260130,
                    LocalDate.of(2026, 1, 30), new BigDecimal("200"), null);

            List<OsfiLcrReportDto> result = mapper.toLcrReport(List.of(d1, d2));

            assertEquals(1, result.size());
            OsfiLcrSegmentDataDto seg = result.get(0).getSegmentData().get(0);
            assertEquals(2, seg.getDateData().size());
            assertEquals(20260129, seg.getDateData().get(0).getDateSkey());
            assertEquals(20260130, seg.getDateData().get(1).getDateSkey());
        }
    }

    // ------------------------------------------------------------------
    // toLcrMetricReport
    // ------------------------------------------------------------------

    @Nested
    @DisplayName("toLcrMetricReport")
    class ToLcrMetricReport {

        @Test
        @DisplayName("empty list returns empty result")
        void emptyInput() {
            List<OsfiLcrMetricReportDto> result = mapper.toLcrMetricReport(Collections.emptyList());
            assertNotNull(result);
            assertTrue(result.isEmpty());
        }

        @Test
        @DisplayName("single line maps rwAmountRptCcy correctly")
        void singleLineWithRwAmount() {
            LcrReportLine line = createLine(1L, "OSFI_LCR_METRIC", "43(a)", "11001", "Cash & Cash Equivalents",
                    createLevel(1L, 1, "10", "High Quality Liquid Asset"),
                    createLevel(2L, 2, "110", "Cash & Cash Equivalents"));

            LcrReportData data = createData(1L, line, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29),
                    new BigDecimal("6189552440.65"),
                    new BigDecimal("6189552440.65"));

            List<OsfiLcrMetricReportDto> result = mapper.toLcrMetricReport(List.of(data));

            assertEquals(1, result.size());
            OsfiLcrMetricReportDto dto = result.get(0);
            assertEquals("OSFI_LCR_METRIC", dto.getReportCode());
            assertEquals("11001", dto.getReportLineCode());

            OsfiLcrMetricDateDataDto dd = dto.getSegmentData().get(0).getDateData().get(0);
            assertEquals(0, new BigDecimal("6189552440.65").compareTo(dd.getAmountRptCcy()));
            assertEquals(0, new BigDecimal("6189552440.65").compareTo(dd.getRwAmountRptCcy()));
        }

        @Test
        @DisplayName("null rwAmountRptCcy is preserved as null")
        void nullRwAmount() {
            LcrReportLine line = createLine(1L, "OSFI_LCR_METRIC", "43(a)", "11001", "Line",
                    createLevel(1L, 1, "10", "L1"));

            LcrReportData data = createData(1L, line, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), BigDecimal.TEN, null);

            List<OsfiLcrMetricReportDto> result = mapper.toLcrMetricReport(List.of(data));

            OsfiLcrMetricDateDataDto dd = result.get(0).getSegmentData().get(0).getDateData().get(0);
            assertNull(dd.getRwAmountRptCcy());
        }

        @Test
        @DisplayName("3-level hierarchy is mapped correctly")
        void threeLevelHierarchy() {
            LcrReportLine line = createLine(1L, "OSFI_LCR_METRIC", "43(a)", "21101", "Retail & SME - Stable",
                    createLevel(1L, 1, "20", "Net Cash Outflows"),
                    createLevel(2L, 2, "210", "Cash Outflows"),
                    createLevel(3L, 3, "2110", "Retail & SME"));

            LcrReportData data = createData(1L, line, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("500"), new BigDecimal("400"));

            List<OsfiLcrMetricReportDto> result = mapper.toLcrMetricReport(List.of(data));

            assertEquals(3, result.get(0).getLevels().size());
            assertEquals("20", result.get(0).getLevels().get(0).getLevelCode());
            assertEquals("210", result.get(0).getLevels().get(1).getLevelCode());
            assertEquals("2110", result.get(0).getLevels().get(2).getLevelCode());
        }

        @Test
        @DisplayName("multiple segments sorted by order")
        void multipleSegmentsSorted() {
            LcrReportLine line = createLine(1L, "OSFI_LCR_METRIC", "43(a)", "11001", "Coins",
                    createLevel(1L, 1, "10", "HQLA"));

            LcrReportData d1 = createData(1L, line, segCaRetail, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("100"), new BigDecimal("80"));
            LcrReportData d2 = createData(2L, line, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("200"), new BigDecimal("160"));

            List<OsfiLcrMetricReportDto> result = mapper.toLcrMetricReport(List.of(d1, d2));

            List<OsfiLcrMetricSegmentDataDto> segs = result.get(0).getSegmentData();
            assertEquals(2, segs.size());
            assertEquals("Enterprise", segs.get(0).getSegmentName());
            assertEquals("CA Retail", segs.get(1).getSegmentName());
        }

        @Test
        @DisplayName("duplicate line codes with different IDs produce separate DTOs")
        void duplicateLineCodesDifferentIds() {
            LcrReportLine line1 = createLine(1L, "OSFI_LCR_METRIC", "50", "22209", "Inflows",
                    createLevel(1L, 1, "20", "Net Cash Outflows"),
                    createLevel(2L, 2, "260", "Loans"));
            LcrReportLine line2 = createLine(2L, "OSFI_LCR_METRIC", "", "22209", "Inflows",
                    createLevel(3L, 1, "20", "Net Cash Outflows"),
                    createLevel(4L, 2, "260", "Loans"));

            LcrReportData d1 = createData(1L, line1, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("100"), new BigDecimal("90"));
            LcrReportData d2 = createData(2L, line2, segEnterprise, 20260129,
                    LocalDate.of(2026, 1, 29), new BigDecimal("200"), new BigDecimal("180"));

            List<OsfiLcrMetricReportDto> result = mapper.toLcrMetricReport(List.of(d1, d2));

            assertEquals(2, result.size(), "Duplicate line codes with different entity IDs must produce separate DTOs");
        }
    }

    // ------------------------------------------------------------------
    // Factory helpers
    // ------------------------------------------------------------------

    private LcrSegment createSegment(Long id, int order, String name) {
        LcrSegment s = new LcrSegment();
        s.setId(id);
        s.setSegmentOrder(order);
        s.setSegmentName(name);
        return s;
    }

    private LcrReportLineLevel createLevel(Long id, int order, String code, String desc) {
        LcrReportLineLevel l = new LcrReportLineLevel();
        l.setId(id);
        l.setLevelOrder(order);
        l.setLevelCode(code);
        l.setLevelDesc(desc);
        return l;
    }

    private LcrReportLine createLine(Long id, String reportCode, String paraCode,
                                     String lineCode, String lineName,
                                     LcrReportLineLevel... levels) {
        LcrReportLine line = new LcrReportLine();
        line.setId(id);
        line.setReportCode(reportCode);
        line.setParaCode(paraCode);
        line.setReportLineCode(lineCode);
        line.setReportLineName(lineName);
        List<LcrReportLineLevel> lvls = new ArrayList<>();
        for (LcrReportLineLevel l : levels) {
            l.setReportLine(line);
            lvls.add(l);
        }
        line.setLevels(lvls);
        return line;
    }

    private LcrReportData createData(Long id, LcrReportLine line, LcrSegment segment,
                                     int dateSkey, LocalDate calendarDate,
                                     BigDecimal amount, BigDecimal rwAmount) {
        LcrReportData d = new LcrReportData();
        d.setId(id);
        d.setReportLine(line);
        d.setSegment(segment);
        d.setDateSkey(dateSkey);
        d.setCalendarDate(calendarDate);
        d.setAmountRptCcy(amount);
        d.setRwAmountRptCcy(rwAmount);
        return d;
    }
}
