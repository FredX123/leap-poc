package com.leappoc.report.repository.lcr;

import com.leappoc.report.model.lcr.LcrReferenceData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LcrReferenceDataRepository extends JpaRepository<LcrReferenceData, Long> {

    List<LcrReferenceData> findByCalcIdOrderByReportingRowAsc(Integer calcId);

    long countByCalcId(Integer calcId);
}

