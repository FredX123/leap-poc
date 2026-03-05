package com.leappoc.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;

/**
 * DTO for a single budget row.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BudgetRowDto {

    private Long id;
    private String itemDescription;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlyBudget;

    /** Computed: monthlyBudget - monthlyExpenses.  Positive = under budget. */
    private BigDecimal budgetVariance;

    /** Computed: (monthlyExpenses / monthlyBudget) * 100.  Shows % consumed. */
    private BigDecimal budgetUsagePercent;

    public BudgetRowDto() {}

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }

    public BigDecimal getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(BigDecimal monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }

    public BigDecimal getMonthlyBudget() { return monthlyBudget; }
    public void setMonthlyBudget(BigDecimal monthlyBudget) { this.monthlyBudget = monthlyBudget; }

    public BigDecimal getBudgetVariance() { return budgetVariance; }
    public void setBudgetVariance(BigDecimal budgetVariance) { this.budgetVariance = budgetVariance; }

    public BigDecimal getBudgetUsagePercent() { return budgetUsagePercent; }
    public void setBudgetUsagePercent(BigDecimal budgetUsagePercent) { this.budgetUsagePercent = budgetUsagePercent; }
}
