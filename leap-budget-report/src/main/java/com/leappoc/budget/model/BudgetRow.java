package com.leappoc.budget.model;

import java.math.BigDecimal;

/**
 * Domain entity for a budget line item (in-memory storage).
 */
public class BudgetRow {

    private Long id;
    private String itemDescription;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlyBudget;

    public BudgetRow() {}

    public BudgetRow(Long id, String itemDescription, BigDecimal monthlyExpenses, BigDecimal monthlyBudget) {
        this.id = id;
        this.itemDescription = itemDescription;
        this.monthlyExpenses = monthlyExpenses;
        this.monthlyBudget = monthlyBudget;
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }

    public BigDecimal getMonthlyExpenses() { return monthlyExpenses; }
    public void setMonthlyExpenses(BigDecimal monthlyExpenses) { this.monthlyExpenses = monthlyExpenses; }

    public BigDecimal getMonthlyBudget() { return monthlyBudget; }
    public void setMonthlyBudget(BigDecimal monthlyBudget) { this.monthlyBudget = monthlyBudget; }
}
