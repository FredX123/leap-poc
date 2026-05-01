package com.leappoc.report.repository.lcr;

import com.leappoc.report.model.lcr.LcrCalcLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LcrCalcLineRepository extends JpaRepository<LcrCalcLine, Long> {

    List<LcrCalcLine> findAllByOrderByDisplayOrderAsc();
}
