package com.leappoc.report.controller.budget;

import com.leappoc.report.service.budget.BudgetService;
import com.leappoc.shared.dto.BudgetRowDto;
import com.leappoc.shared.security.RoleConstants;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    /**
     * GET /api/budget — available to APP_READ/APP_WRITE role or GRP_READ/GRP_WRITE group.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('" + RoleConstants.APP_READ + "', '" + RoleConstants.APP_WRITE + "')"
            + " or hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<List<BudgetRowDto>> list() {
        return ResponseEntity.ok(budgetService.getAllRows());
    }

    /**
     * PUT /api/budget/{id} — available to APP_WRITE role or GRP_WRITE group.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('" + RoleConstants.APP_WRITE + "')"
            + " or hasAuthority('" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<BudgetRowDto> update(@PathVariable Long id, @RequestBody BudgetRowDto dto) {
        return ResponseEntity.ok(budgetService.updateRow(id, dto));
    }

    @GetMapping( "/admin-only")
    @PreAuthorize("hasRole('" + RoleConstants.APP_ADMIN + "')"
            + " or hasAuthority('" + RoleConstants.GROUP_GRP_ADMIN + "')")
    public void adminOnly() {
        // Do nothing. for authorization testing only.
    }

    @GetMapping( "/write-only")
    @PreAuthorize("hasRole('" + RoleConstants.APP_WRITE + "')"
            + " or hasAuthority('" + RoleConstants.GROUP_GRP_WRITE + "')")
    public void writeOnly() {
        // Do nothing. for authorization testing only.
    }

    @GetMapping( "/read-only")
    @PreAuthorize("hasRole('" + RoleConstants.APP_READ + "')"
            + " or hasAuthority('" + RoleConstants.GROUP_GRP_READ + "')")
    public void readOnly() {
        // Do nothing. for authorization testing only.
    }
}
