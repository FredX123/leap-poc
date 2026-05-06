package com.leappoc.report.repository.lcr;

import com.leappoc.report.model.lcr.LcrReportData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LcrReportDataRepository extends JpaRepository<LcrReportData, Long> {

    @Query("SELECT d " +
            " FROM LcrReportData d " +
           "       JOIN FETCH d.reportLine rl " +
           "       LEFT JOIN FETCH d.segment s " +
           " WHERE rl.reportCode = :reportCode " +
           "   AND d.calendarDate BETWEEN :startDate AND :endDate " +
           "   AND d.segment IS NOT NULL " +
           " ORDER BY rl.reportLineCode, s.segmentOrder, d.dateSkey")
    List<LcrReportData> findByReportCodeAndDateRange(
            @Param("reportCode") String reportCode,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT d " +
           " FROM LcrReportData d " +
           "      JOIN FETCH d.reportLine rl " +
           "      LEFT JOIN FETCH d.segment s " +
           " WHERE rl.reportCode = :reportCode " +
           "   AND s.segmentName = :segmentName " +
           "   AND d.calendarDate BETWEEN :startDate AND :endDate " +
           " ORDER BY rl.reportLineCode, d.dateSkey")
    List<LcrReportData> findByReportCodeAndSegmentAndDateRange(
            @Param("reportCode") String reportCode,
            @Param("segmentName") String segmentName,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // --- LCR Calc report queries ---

    @Query("SELECT d " +
           "  FROM LcrReportData d " +
           "       JOIN FETCH d.reportLine rl " +
           " WHERE d.calcId = :calcId " +
           "   AND d.reportableCurrency = :currency " +
           "   AND d.calendarDate = :reportingDate " +
           " ORDER BY rl.displayOrder")
    List<LcrReportData> findByCalcIdAndCurrencyAndDate(
            @Param("calcId") Integer calcId,
            @Param("currency") String currency,
            @Param("reportingDate") LocalDate reportingDate);

    @Query("SELECT DISTINCT d.reportableCurrency " +
           "  FROM LcrReportData d " +
           " WHERE d.calcId = :calcId " +
           " ORDER BY d.reportableCurrency")
    List<String> findDistinctCurrenciesByCalcId(@Param("calcId") Integer calcId);
}
