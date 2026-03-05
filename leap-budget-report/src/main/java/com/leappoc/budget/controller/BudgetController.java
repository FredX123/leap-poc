package com.leappoc.budget.controller;

import com.leappoc.budget.service.BudgetService;
import com.leappoc.shared.dto.BudgetRowDto;
import com.leappoc.shared.security.RoleConstants;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    /**
     * GET /api/budget — available to APP_READ or APP_WRITE.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('" + RoleConstants.APP_READ + "', '" + RoleConstants.APP_WRITE + "')")
    public ResponseEntity<List<BudgetRowDto>> list() {
        return ResponseEntity.ok(budgetService.getAllRows());
    }

    /**
     * PUT /api/budget/{id} — available ONLY to APP_WRITE.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('" + RoleConstants.APP_WRITE + "')")
    public ResponseEntity<BudgetRowDto> update(@PathVariable Long id, @RequestBody BudgetRowDto dto) {
        try {
            return ResponseEntity.ok(budgetService.updateRow(id, dto));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
