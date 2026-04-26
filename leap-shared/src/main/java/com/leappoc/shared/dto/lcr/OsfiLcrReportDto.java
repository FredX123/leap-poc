package com.leappoc.shared.dto.lcr;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class OsfiLcrReportDto {

    @JsonProperty("v_report_code")
    private String reportCode;

    @JsonProperty("v_para_code")
    private String paraCode;

    @JsonIgnore
    private List<ReportLineLevelDto> levels = new ArrayList<>();

    @JsonProperty("v_report_line_code")
    private String reportLineCode;

    @JsonProperty("v_report_line_name")
    private String reportLineName;

    @JsonProperty("segment_data")
    private List<OsfiLcrSegmentDataDto> segmentData;

    public OsfiLcrReportDto() {}

    public String getReportCode() { return reportCode; }
    public void setReportCode(String reportCode) { this.reportCode = reportCode; }

    public String getParaCode() { return paraCode; }
    public void setParaCode(String paraCode) { this.paraCode = paraCode; }

    public List<ReportLineLevelDto> getLevels() { return levels; }
    public void setLevels(List<ReportLineLevelDto> levels) { this.levels = levels; }

    public String getReportLineCode() { return reportLineCode; }
    public void setReportLineCode(String reportLineCode) { this.reportLineCode = reportLineCode; }

    public String getReportLineName() { return reportLineName; }
    public void setReportLineName(String reportLineName) { this.reportLineName = reportLineName; }

    public List<OsfiLcrSegmentDataDto> getSegmentData() { return segmentData; }
    public void setSegmentData(List<OsfiLcrSegmentDataDto> segmentData) { this.segmentData = segmentData; }

    @JsonAnyGetter
    public Map<String, String> getLevelFields() {
        Map<String, String> fields = new LinkedHashMap<>();
        for (int i = 0; i < levels.size(); i++) {
            String suffix = String.format("%02d", i + 1);
            fields.put("v_report_line_level_code_" + suffix, levels.get(i).getLevelCode());
            fields.put("v_report_line_level_desc_" + suffix, levels.get(i).getLevelDesc());
        }
        return fields;
    }

    @JsonAnySetter
    public void setDynamicField(String key, Object value) {
        if (key.startsWith("v_report_line_level_code_")) {
            int idx = Integer.parseInt(key.substring("v_report_line_level_code_".length())) - 1;
            ensureLevelSize(idx + 1);
            levels.get(idx).setLevelCode(String.valueOf(value));
        } else if (key.startsWith("v_report_line_level_desc_")) {
            int idx = Integer.parseInt(key.substring("v_report_line_level_desc_".length())) - 1;
            ensureLevelSize(idx + 1);
            levels.get(idx).setLevelDesc(String.valueOf(value));
        }
    }

    private void ensureLevelSize(int size) {
        while (levels.size() < size) {
            levels.add(new ReportLineLevelDto());
        }
    }
}
