package com.leappoc.shared.dto.lcr;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class OsfiLcrSegmentDataDto {

    @JsonProperty("n_segment_order")
    private Integer segmentOrder;

    @JsonProperty("v_segment_name")
    private String segmentName;

    @JsonProperty("date_data")
    private List<OsfiLcrDateDataDto> dateData;

    public OsfiLcrSegmentDataDto() {}

    public Integer getSegmentOrder() { return segmentOrder; }
    public void setSegmentOrder(Integer segmentOrder) { this.segmentOrder = segmentOrder; }

    public String getSegmentName() { return segmentName; }
    public void setSegmentName(String segmentName) { this.segmentName = segmentName; }

    public List<OsfiLcrDateDataDto> getDateData() { return dateData; }
    public void setDateData(List<OsfiLcrDateDataDto> dateData) { this.dateData = dateData; }
}
