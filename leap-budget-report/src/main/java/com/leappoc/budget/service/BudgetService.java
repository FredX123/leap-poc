package com.leappoc.budget.service;

import com.leappoc.shared.dto.BudgetRowDto;

import java.util.List;

/**
 * Service interface — decouple controller from repository/implementation.
 */
public interface BudgetService {

    List<BudgetRowDto> getAllRows();

    BudgetRowDto updateRow(Long id, BudgetRowDto dto);
}
