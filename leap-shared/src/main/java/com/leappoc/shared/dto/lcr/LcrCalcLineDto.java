package com.leappoc.shared.dto.lcr;

import java.math.BigDecimal;

public class LcrCalcLineDto {

    private Long id;
    private String lineCode;
    private String lineName;
    private String sectionCode;
    private String sectionName;
    private String subsectionCode;
    private String subsectionName;
    private BigDecimal weight;
    private String weightedLineCode;
    private String lineType;
    private Integer displayOrder;
    private BigDecimal marketValue;
    private BigDecimal weightedAmount;
    private BigDecimal adjustmentValue;
    private String adjustmentComment;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLineCode() { return lineCode; }
    public void setLineCode(String lineCode) { this.lineCode = lineCode; }

    public String getLineName() { return lineName; }
    public void setLineName(String lineName) { this.lineName = lineName; }

    public String getSectionCode() { return sectionCode; }
    public void setSectionCode(String sectionCode) { this.sectionCode = sectionCode; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public String getSubsectionCode() { return subsectionCode; }
    public void setSubsectionCode(String subsectionCode) { this.subsectionCode = subsectionCode; }

    public String getSubsectionName() { return subsectionName; }
    public void setSubsectionName(String subsectionName) { this.subsectionName = subsectionName; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public String getWeightedLineCode() { return weightedLineCode; }
    public void setWeightedLineCode(String weightedLineCode) { this.weightedLineCode = weightedLineCode; }

    public String getLineType() { return lineType; }
    public void setLineType(String lineType) { this.lineType = lineType; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public BigDecimal getMarketValue() { return marketValue; }
    public void setMarketValue(BigDecimal marketValue) { this.marketValue = marketValue; }

    public BigDecimal getWeightedAmount() { return weightedAmount; }
    public void setWeightedAmount(BigDecimal weightedAmount) { this.weightedAmount = weightedAmount; }

    public BigDecimal getAdjustmentValue() { return adjustmentValue; }
    public void setAdjustmentValue(BigDecimal adjustmentValue) { this.adjustmentValue = adjustmentValue; }

    public String getAdjustmentComment() { return adjustmentComment; }
    public void setAdjustmentComment(String adjustmentComment) { this.adjustmentComment = adjustmentComment; }
}
