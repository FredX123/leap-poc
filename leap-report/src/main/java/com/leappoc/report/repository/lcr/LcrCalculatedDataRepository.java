package com.leappoc.report.repository.lcr;

import com.leappoc.report.model.lcr.LcrCalculatedData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LcrCalculatedDataRepository extends JpaRepository<LcrCalculatedData, Long> {

    @Query("SELECT d FROM LcrCalculatedData d LEFT JOIN FETCH d.dependencies WHERE d.calcId = :calcId")
    List<LcrCalculatedData> findByCalcIdWithDependencies(@Param("calcId") Integer calcId);

    long countByCalcId(Integer calcId);
}

