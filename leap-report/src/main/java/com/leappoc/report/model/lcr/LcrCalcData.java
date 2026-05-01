package com.leappoc.report.model.lcr;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "LCR_CALC_DATA")
public class LcrCalcData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "n_calc_id", nullable = false)
    private Integer calcId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "line_id", nullable = false)
    private LcrCalcLine line;

    @Column(name = "v_reportable_currency", nullable = false, length = 10)
    private String reportableCurrency;

    @Column(name = "n_market_value", precision = 20, scale = 5)
    private BigDecimal marketValue;

    @Column(name = "n_weighted_amount", precision = 20, scale = 5)
    private BigDecimal weightedAmount;

    @Column(name = "d_reporting_date", nullable = false)
    private LocalDate reportingDate;

    public LcrCalcData() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

    public LcrCalcLine getLine() { return line; }
    public void setLine(LcrCalcLine line) { this.line = line; }

    public String getReportableCurrency() { return reportableCurrency; }
    public void setReportableCurrency(String reportableCurrency) { this.reportableCurrency = reportableCurrency; }

    public BigDecimal getMarketValue() { return marketValue; }
    public void setMarketValue(BigDecimal marketValue) { this.marketValue = marketValue; }

    public BigDecimal getWeightedAmount() { return weightedAmount; }
    public void setWeightedAmount(BigDecimal weightedAmount) { this.weightedAmount = weightedAmount; }

    public LocalDate getReportingDate() { return reportingDate; }
    public void setReportingDate(LocalDate reportingDate) { this.reportingDate = reportingDate; }
}
