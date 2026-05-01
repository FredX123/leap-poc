package com.leappoc.shared.dto.lcr;

import java.util.List;

public class LcrCalcReportDto {

    private Integer calcId;
    private String reportingDate;
    private String currency;
    private List<String> availableCurrencies;
    private List<LcrCalcLineDto> lines;

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

    public String getReportingDate() { return reportingDate; }
    public void setReportingDate(String reportingDate) { this.reportingDate = reportingDate; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public List<String> getAvailableCurrencies() { return availableCurrencies; }
    public void setAvailableCurrencies(List<String> availableCurrencies) { this.availableCurrencies = availableCurrencies; }

    public List<LcrCalcLineDto> getLines() { return lines; }
    public void setLines(List<LcrCalcLineDto> lines) { this.lines = lines; }
}
