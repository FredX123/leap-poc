package com.leappoc.shared.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCommentRequest {

    @NotBlank(message = "Report type is required")
    private String reportType;

    @NotBlank(message = "Line key is required")
    private String lineKey;

    private String segmentName;

    @NotBlank(message = "Content is required")
    @Size(max = 4000, message = "Content must not exceed 4000 characters")
    private String content;

    private Long parentId;

    private String driverCode = "NONE";

    public CreateCommentRequest() {}

    // --- Getters & Setters ---

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getLineKey() { return lineKey; }
    public void setLineKey(String lineKey) { this.lineKey = lineKey; }

    public String getSegmentName() { return segmentName; }
    public void setSegmentName(String segmentName) { this.segmentName = segmentName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getDriverCode() { return driverCode; }
    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }
}
