package com.leappoc.shared.dto.lcr;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ReportLineLevelDto {

    @JsonProperty("v_level_code")
    private String levelCode;

    @JsonProperty("v_level_desc")
    private String levelDesc;

    public ReportLineLevelDto() {}

    public ReportLineLevelDto(String levelCode, String levelDesc) {
        this.levelCode = levelCode;
        this.levelDesc = levelDesc;
    }

    public String getLevelCode() { return levelCode; }
    public void setLevelCode(String levelCode) { this.levelCode = levelCode; }

    public String getLevelDesc() { return levelDesc; }
    public void setLevelDesc(String levelDesc) { this.levelDesc = levelDesc; }
}
