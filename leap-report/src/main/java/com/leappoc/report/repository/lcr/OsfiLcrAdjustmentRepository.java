package com.leappoc.report.repository.lcr;

import com.leappoc.report.model.lcr.OsfiLcrAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OsfiLcrAdjustmentRepository extends JpaRepository<OsfiLcrAdjustment, Long> {

    @Query("SELECT a " +
           "  FROM OsfiLcrAdjustment a " +
           "       JOIN FETCH a.line l " +
           " WHERE a.calcId = :calcId " +
           "   AND a.reportableCurrency = :currency")
    List<OsfiLcrAdjustment> findByCalcIdAndCurrency(
            @Param("calcId") Integer calcId,
            @Param("currency") String currency);

    Optional<OsfiLcrAdjustment> findByCalcIdAndLineIdAndReportableCurrency(
            Integer calcId, Long lineId, String reportableCurrency);
}

