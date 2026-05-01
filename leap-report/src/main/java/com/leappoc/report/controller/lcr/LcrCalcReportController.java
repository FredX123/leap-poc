package com.leappoc.report.controller.lcr;

import com.leappoc.report.service.lcr.LcrCalcReportService;
import com.leappoc.shared.dto.lcr.LcrCalcAdjustmentRequest;
import com.leappoc.shared.dto.lcr.LcrCalcReportDto;
import com.leappoc.shared.dto.lcr.LcrCalcReportRequest;
import com.leappoc.shared.security.RoleConstants;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/report/lcr-calc")
public class LcrCalcReportController {

    private final LcrCalcReportService service;

    public LcrCalcReportController(LcrCalcReportService service) {
        this.service = service;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<LcrCalcReportDto> getReport(@RequestBody LcrCalcReportRequest request) {
        LocalDate date = LocalDate.parse(request.getReportingDate());
        LcrCalcReportDto result = service.getReport(request.getCalcId(), request.getCurrency(), date);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/adjustment")
    @PreAuthorize("hasAuthority('" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<Void> saveAdjustment(
            @RequestBody LcrCalcAdjustmentRequest request,
            Authentication auth) {
        service.saveAdjustment(request, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/adjustment")
    @PreAuthorize("hasAuthority('" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<Void> deleteAdjustment(
            @RequestParam Integer calcId,
            @RequestParam Long lineId,
            @RequestParam String currency) {
        service.deleteAdjustment(calcId, lineId, currency);
        return ResponseEntity.noContent().build();
    }
}
