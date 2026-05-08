package com.leappoc.report.model.lcr;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "LCR_REFERENCE_DATA")
public class LcrReferenceData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "n_calc_id", nullable = false)
    private Integer calcId;

    @Column(name = "n_reporting_row", nullable = false)
    private Integer reportingRow;

    @Column(name = "v_product_class_result", nullable = false, length = 500)
    private String productClassResult;

    @Column(name = "v_reporting_type_amount", nullable = false, length = 200)
    private String reportingTypeAmount;

    @Column(name = "v_original_currency", nullable = false, length = 10)
    private String originalCurrency;

    @Column(name = "n_original_amount", precision = 38, scale = 15)
    private BigDecimal originalAmount;

    @Column(name = "v_reporting_currency", nullable = false, length = 10)
    private String reportingCurrency;

    @Column(name = "n_reporting_amount", precision = 38, scale = 15)
    private BigDecimal reportingAmount;

    @Column(name = "v_reportable_currency", length = 10)
    private String reportableCurrency;

    @Column(name = "n_row_no")
    private Integer rowNo;

    public LcrReferenceData() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

    public Integer getReportingRow() { return reportingRow; }
    public void setReportingRow(Integer reportingRow) { this.reportingRow = reportingRow; }

    public String getProductClassResult() { return productClassResult; }
    public void setProductClassResult(String productClassResult) { this.productClassResult = productClassResult; }

    public String getReportingTypeAmount() { return reportingTypeAmount; }
    public void setReportingTypeAmount(String reportingTypeAmount) { this.reportingTypeAmount = reportingTypeAmount; }

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

