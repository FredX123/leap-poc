package com.leappoc.shared.dto.lcr;

public class OsfiLcrRequest {

    private Integer calcId;
    private String reportingDate;
    private String currency;

    public OsfiLcrRequest() {}

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

    public String getReportingDate() { return reportingDate; }
    public void setReportingDate(String reportingDate) { this.reportingDate = reportingDate; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
}

