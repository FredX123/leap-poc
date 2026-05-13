package com.leappoc.shared.dto.lcr;

import java.math.BigDecimal;

public class OsfiLcrAdjustmentRequest {

    private Integer calcId;
    private String lineCode;
    private String currency;
    private BigDecimal adjustmentValue;
    private String comment;

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

    public String getLineCode() { return lineCode; }
    public void setLineCode(String lineCode) { this.lineCode = lineCode; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getAdjustmentValue() { return adjustmentValue; }
    public void setAdjustmentValue(BigDecimal adjustmentValue) { this.adjustmentValue = adjustmentValue; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
}

