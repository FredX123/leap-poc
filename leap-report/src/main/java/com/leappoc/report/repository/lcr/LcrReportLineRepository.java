package com.leappoc.report.repository.lcr;

import com.leappoc.report.model.lcr.LcrReportLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LcrReportLineRepository extends JpaRepository<LcrReportLine, Long> {

    List<LcrReportLine> findByReportCodeOrderByDisplayOrderAsc(String reportCode);
}

