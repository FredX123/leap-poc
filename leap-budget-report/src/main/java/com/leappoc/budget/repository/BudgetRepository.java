package com.leappoc.budget.repository;

import com.leappoc.budget.model.BudgetRow;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for budget rows.
 * Backed by an in-memory store for POC; swap for JPA later.
 */
public interface BudgetRepository {

    List<BudgetRow> findAll();

    Optional<BudgetRow> findById(Long id);

    BudgetRow save(BudgetRow row);
}
