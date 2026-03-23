package com.leappoc.budget.service;

import com.leappoc.budget.model.BudgetReport;
import com.leappoc.budget.repository.BudgetRepository;
import com.leappoc.shared.dto.BudgetRowDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository repository;

    public BudgetServiceImpl(BudgetRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetRowDto> getAllRows() {
        return repository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public BudgetRowDto updateRow(Long id, BudgetRowDto dto) {
        BudgetReport row = repository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Budget row not found: " + id));

        if (dto.getMonthlyExpenses() != null) {
            row.setMonthlyExpenses(dto.getMonthlyExpenses());
        }
        if (dto.getMonthlyBudget() != null) {
            row.setMonthlyBudget(dto.getMonthlyBudget());
        }

        repository.save(row);
        return toDto(row);
    }

    // --------------- mapping helpers ---------------

    private BudgetRowDto toDto(BudgetReport row) {
        BudgetRowDto dto = new BudgetRowDto();
        dto.setId(row.getId());
        dto.setItemDescription(row.getItemDescription());
        dto.setMonthlyExpenses(row.getMonthlyExpenses());
        dto.setMonthlyBudget(row.getMonthlyBudget());

        // Budget Variance = Budget - Expenses  (positive = under budget)
        BigDecimal variance = row.getMonthlyBudget().subtract(row.getMonthlyExpenses());
        dto.setBudgetVariance(variance);

        // Budget Usage % = (Expenses / Budget) * 100  (e.g., 96.00 means 96 %)
        if (row.getMonthlyBudget().compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal usage = row.getMonthlyExpenses()
                    .divide(row.getMonthlyBudget(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
            dto.setBudgetUsagePercent(usage);
        } else {
            dto.setBudgetUsagePercent(BigDecimal.ZERO);
        }

        return dto;
    }
}
