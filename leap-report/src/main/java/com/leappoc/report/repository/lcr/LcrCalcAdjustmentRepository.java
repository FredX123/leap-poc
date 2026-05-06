package com.leappoc.report.repository.lcr;

import com.leappoc.report.model.lcr.LcrCalcAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LcrCalcAdjustmentRepository extends JpaRepository<LcrCalcAdjustment, Long> {

    @Query("SELECT a " +
           "  FROM LcrCalcAdjustment a " +
           "       JOIN FETCH a.line l " +
           " WHERE a.calcId = :calcId " +
           "   AND a.reportableCurrency = :currency")
    List<LcrCalcAdjustment> findByCalcIdAndCurrency(
            @Param("calcId") Integer calcId,
            @Param("currency") String currency);

    Optional<LcrCalcAdjustment> findByCalcIdAndLineIdAndReportableCurrency(
            Integer calcId, Long lineId, String reportableCurrency);
}
