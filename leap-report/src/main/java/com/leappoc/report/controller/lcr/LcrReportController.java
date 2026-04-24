package com.leappoc.report.controller.lcr;

import com.leappoc.report.service.lcr.LcrReportService;
import com.leappoc.shared.dto.lcr.*;
import com.leappoc.shared.security.RoleConstants;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAnyRole('" + RoleConstants.APP_READ + "', '" + RoleConstants.APP_WRITE + "')"
            + " or hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<List<OsfiLcrReportDto>> getOsfiLcrReport(@RequestBody LcrDateRequest request) {
        List<OsfiLcrReportDto> result = lcrReportService.getOsfiLcrReport(
                request.getStartDate(), request.getEndDate());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/osfi-lcr-metric")
    @PreAuthorize("hasAnyRole('" + RoleConstants.APP_READ + "', '" + RoleConstants.APP_WRITE + "')"
            + " or hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '" + RoleConstants.GROUP_GRP_WRITE + "')")
    public ResponseEntity<List<OsfiLcrMetricReportDto>> getOsfiLcrMetricReport(@RequestBody LcrMetricRequest request) {
        List<OsfiLcrMetricReportDto> result = lcrReportService.getOsfiLcrMetricReport(
                request.getSegment(), request.getStartDate(), request.getEndDate());
        return ResponseEntity.ok(result);
    }
}
