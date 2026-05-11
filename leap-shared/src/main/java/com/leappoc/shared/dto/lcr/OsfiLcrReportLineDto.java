package com.leappoc.shared.dto.lcr;

import java.math.BigDecimal;

public class OsfiLcrReportLineDto {

    private Long id;
    private String lineCode;
    private String lineName;
    private String lineType; // section, subsection, subheader, data
    private Integer displayOrder;
    private BigDecimal weight;
    private String weightedLineCode;

    public OsfiLcrReportLineDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLineCode() { return lineCode; }
    public void setLineCode(String lineCode) { this.lineCode = lineCode; }

    public String getLineName() { return lineName; }
    public void setLineName(String lineName) { this.lineName = lineName; }

    public String getLineType() { return lineType; }
    public void setLineType(String lineType) { this.lineType = lineType; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public String getWeightedLineCode() { return weightedLineCode; }
    public void setWeightedLineCode(String weightedLineCode) { this.weightedLineCode = weightedLineCode; }
}

