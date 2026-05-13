package com.leappoc.report.model.lcr;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "OSFI_LCR_ADJUSTMENT")
public class OsfiLcrAdjustment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "n_calc_id", nullable = false)
    private Integer calcId;

    @Column(name = "v_line_code", nullable = false, length = 20)
    private String lineCode;

    @Column(name = "v_reportable_currency", nullable = false, length = 10)
    private String reportableCurrency;

    @Column(name = "n_adjustment_value", nullable = false, precision = 20, scale = 5)
    private BigDecimal adjustmentValue;

    @Column(name = "v_comment", nullable = false, length = 500)
    private String comment;

    @Column(name = "v_created_by", nullable = false, length = 100)
    private String createdBy;

    @Column(name = "dt_created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "v_updated_by", length = 100)
    private String updatedBy;

    @Column(name = "dt_updated_at")
    private LocalDateTime updatedAt;

    public OsfiLcrAdjustment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

    public String getLineCode() { return lineCode; }
    public void setLineCode(String lineCode) { this.lineCode = lineCode; }

    public String getReportableCurrency() { return reportableCurrency; }
    public void setReportableCurrency(String reportableCurrency) { this.reportableCurrency = reportableCurrency; }

    public BigDecimal getAdjustmentValue() { return adjustmentValue; }
    public void setAdjustmentValue(BigDecimal adjustmentValue) { this.adjustmentValue = adjustmentValue; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

