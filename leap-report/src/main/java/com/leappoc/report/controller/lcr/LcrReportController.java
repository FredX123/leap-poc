package com.leappoc.report.controller.lcr;

import com.leappoc.report.service.lcr.LcrReportService;
import com.leappoc.shared.dto.lcr.*;
import com.leappoc.shared.security.RoleConstants;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/report")
public class LcrReportController {

    private final LcrReportService lcrReportService;

    public LcrReportController(LcrReportService lcrReportService) {
        this.lcrReportService = lcrReportService;
    }

    @PostMapping("/osfi-lcr")
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<OsfiLcrReportDto> getOsfiLcrReport(@RequestBody OsfiLcrRequest request) {
        OsfiLcrReportDto result = lcrReportService.getOsfiLcrReport(request.getCalcId(), request.getCurrency());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/osfi-lcr-metric")
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<List<OsfiLcrMetricReportDto>> getOsfiLcrMetricReport(@RequestBody LcrMetricRequest request) {
        List<OsfiLcrMetricReportDto> result = lcrReportService.getOsfiLcrMetricReport(
                request.getSegment(), request.getStartDate(), request.getEndDate());
        return ResponseEntity.ok(result);
    }

    // --- Adjustment endpoints ---

    @GetMapping("/osfi-lcr/adjustment")
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<OsfiLcrAdjustmentDto> getAdjustment(
            @RequestParam Integer calcId,
            @RequestParam String lineCode,
            @RequestParam String currency) {
        OsfiLcrAdjustmentDto dto = lcrReportService.getAdjustment(calcId, lineCode, currency);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/osfi-lcr/adjustment")
    @PreAuthorize("hasAuthority('" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<Void> saveAdjustment(
            @RequestBody OsfiLcrAdjustmentRequest request,
            Authentication auth) {
        lcrReportService.saveAdjustment(request, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/osfi-lcr/adjustment")
    @PreAuthorize("hasAuthority('" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<Void> deleteAdjustment(
            @RequestParam Integer calcId,
            @RequestParam String lineCode,
            @RequestParam String currency) {
        lcrReportService.deleteAdjustment(calcId, lineCode, currency);
        return ResponseEntity.noContent().build();
    }

    // --- Auth test endpoints (for RBAC verification on welcome page) ---

    @GetMapping("/admin-only")
    @PreAuthorize("hasAuthority('" + RoleConstants.GROUP_GRP_ADMIN + "')")
    public void adminOnly() {}

    @GetMapping("/write-only")
    @PreAuthorize("hasAuthority('" + RoleConstants.GROUP_GRP_WRITE + "')")
    public void writeOnly() {}

    @GetMapping("/read-only")
    @PreAuthorize("hasAuthority('" + RoleConstants.GROUP_GRP_READ + "')")
    public void readOnly() {}
}
