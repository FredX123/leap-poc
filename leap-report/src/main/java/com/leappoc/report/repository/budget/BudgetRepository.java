package com.leappoc.report.repository.budget;

import com.leappoc.report.model.budget.BudgetReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<BudgetReport, Long> {
}
