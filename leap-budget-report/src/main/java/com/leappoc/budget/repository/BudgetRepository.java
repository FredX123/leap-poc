package com.leappoc.budget.repository;

import com.leappoc.budget.model.BudgetReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<BudgetReport, Long> {
}
