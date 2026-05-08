package com.leappoc.shared.dto.lcr;

import java.math.BigDecimal;

public class OsfiLcrDependencyDto {

    private String recordId;
    private BigDecimal value;

    public OsfiLcrDependencyDto() {}

    public String getRecordId() { return recordId; }
    public void setRecordId(String recordId) { this.recordId = recordId; }

    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
}

