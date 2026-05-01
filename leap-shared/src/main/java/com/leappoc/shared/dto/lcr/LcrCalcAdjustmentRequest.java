package com.leappoc.shared.dto.lcr;

import java.math.BigDecimal;

public class LcrCalcAdjustmentRequest {

    private Integer calcId;
    private Long lineId;
    private String currency;
    private BigDecimal adjustmentValue;
    private String comment;

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

    public Long getLineId() { return lineId; }
    public void setLineId(Long lineId) { this.lineId = lineId; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getAdjustmentValue() { return adjustmentValue; }
    public void setAdjustmentValue(BigDecimal adjustmentValue) { this.adjustmentValue = adjustmentValue; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}
