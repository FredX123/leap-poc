package com.leappoc.report.repository.lcr;

import com.leappoc.report.model.lcr.LcrCalcData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LcrCalcDataRepository extends JpaRepository<LcrCalcData, Long> {

    @Query("SELECT d FROM LcrCalcData d " +
           "JOIN FETCH d.line l " +
           "WHERE d.calcId = :calcId " +
           "AND d.reportableCurrency = :currency " +
           "AND d.reportingDate = :reportingDate " +
           "ORDER BY l.displayOrder")
    List<LcrCalcData> findByCalcIdAndCurrencyAndDate(
            @Param("calcId") Integer calcId,
            @Param("currency") String currency,
            @Param("reportingDate") LocalDate reportingDate);

    @Query("SELECT DISTINCT d.reportableCurrency FROM LcrCalcData d " +
           "WHERE d.calcId = :calcId " +
           "ORDER BY d.reportableCurrency")
    List<String> findDistinctCurrenciesByCalcId(@Param("calcId") Integer calcId);
}
