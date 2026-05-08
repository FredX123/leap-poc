package com.leappoc.shared.dto.lcr;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class OsfiLcrReferenceDataDto {

    @JsonProperty("reporting_row")
    private Integer reportingRow;

    @JsonProperty("product_class_result")
    private String productClassResult;

    @JsonProperty("reporting_type_amount")
    private String reportingTypeAmount;

    @JsonProperty("calc_id")
    private Integer calcId;

    @JsonProperty("original_currency")
    private String originalCurrency;

    @JsonProperty("original_amount")
    private BigDecimal originalAmount;

    @JsonProperty("reporting_currency")
    private String reportingCurrency;

    @JsonProperty("reporting_amount")
    private BigDecimal reportingAmount;

    @JsonProperty("reportable_currency")
    private String reportableCurrency;

    @JsonProperty("rowNo")
    private Integer rowNo;

    public OsfiLcrReferenceDataDto() {}

    public Integer getReportingRow() { return reportingRow; }
    public void setReportingRow(Integer reportingRow) { this.reportingRow = reportingRow; }

    public String getProductClassResult() { return productClassResult; }
    public void setProductClassResult(String productClassResult) { this.productClassResult = productClassResult; }

    public String getReportingTypeAmount() { return reportingTypeAmount; }
    public void setReportingTypeAmount(String reportingTypeAmount) { this.reportingTypeAmount = reportingTypeAmount; }

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

    public String getOriginalCurrency() { return originalCurrency; }
    public void setOriginalCurrency(String originalCurrency) { this.originalCurrency = originalCurrency; }

    public BigDecimal getOriginalAmount() { return originalAmount; }
    public void setOriginalAmount(BigDecimal originalAmount) { this.originalAmount = originalAmount; }

    public String getReportingCurrency() { return reportingCurrency; }
    public void setReportingCurrency(String reportingCurrency) { this.reportingCurrency = reportingCurrency; }

    public BigDecimal getReportingAmount() { return reportingAmount; }
    public void setReportingAmount(BigDecimal reportingAmount) { this.reportingAmount = reportingAmount; }

    public String getReportableCurrency() { return reportableCurrency; }
    public void setReportableCurrency(String reportableCurrency) { this.reportableCurrency = reportableCurrency; }

    public Integer getRowNo() { return rowNo; }
    public void setRowNo(Integer rowNo) { this.rowNo = rowNo; }
}

