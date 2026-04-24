package com.leappoc.shared.dto.lcr;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OsfiLcrMetricReportDto {

    @JsonProperty("v_report_code")
    private String reportCode;

    @JsonProperty("v_para_code")
    private String paraCode;

    @JsonProperty("v_report_line_level_code_01")
    private String reportLineLevelCode01;

    @JsonProperty("v_report_line_level_desc_01")
    private String reportLineLevelDesc01;

    @JsonProperty("v_report_line_level_code_02")
    private String reportLineLevelCode02;

    @JsonProperty("v_report_line_level_desc_02")
    private String reportLineLevelDesc02;

    @JsonProperty("v_report_line_code")
    private String reportLineCode;

    @JsonProperty("v_report_line_name")
    private String reportLineName;

    @JsonProperty("segment_data")
    private List<OsfiLcrMetricSegmentDataDto> segmentData;

    public OsfiLcrMetricReportDto() {}

    public String getReportCode() { return reportCode; }
    public void setReportCode(String reportCode) { this.reportCode = reportCode; }

    public String getParaCode() { return paraCode; }
    public void setParaCode(String paraCode) { this.paraCode = paraCode; }

    public String getReportLineLevelCode01() { return reportLineLevelCode01; }
    public void setReportLineLevelCode01(String reportLineLevelCode01) { this.reportLineLevelCode01 = reportLineLevelCode01; }

    public String getReportLineLevelDesc01() { return reportLineLevelDesc01; }
    public void setReportLineLevelDesc01(String reportLineLevelDesc01) { this.reportLineLevelDesc01 = reportLineLevelDesc01; }

    public String getReportLineLevelCode02() { return reportLineLevelCode02; }
    public void setReportLineLevelCode02(String reportLineLevelCode02) { this.reportLineLevelCode02 = reportLineLevelCode02; }

    public String getReportLineLevelDesc02() { return reportLineLevelDesc02; }
    public void setReportLineLevelDesc02(String reportLineLevelDesc02) { this.reportLineLevelDesc02 = reportLineLevelDesc02; }

    public String getReportLineCode() { return reportLineCode; }
    public void setReportLineCode(String reportLineCode) { this.reportLineCode = reportLineCode; }

    public String getReportLineName() { return reportLineName; }
    public void setReportLineName(String reportLineName) { this.reportLineName = reportLineName; }

    public List<OsfiLcrMetricSegmentDataDto> getSegmentData() { return segmentData; }
    public void setSegmentData(List<OsfiLcrMetricSegmentDataDto> segmentData) { this.segmentData = segmentData; }
}
