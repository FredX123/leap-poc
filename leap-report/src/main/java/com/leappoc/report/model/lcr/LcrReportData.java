package com.leappoc.report.model.lcr;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "LCR_REPORT_DATA")
public class LcrReportData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_line_id", nullable = false)
    private LcrReportLine reportLine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "segment_id")
    private LcrSegment segment;

    @Column(name = "n_date_skey")
    private Integer dateSkey;

    @Column(name = "d_calander_date")
    private LocalDate calendarDate;

    @Column(name = "n_amount_rpt_ccy", precision = 20, scale = 5)
    private BigDecimal amountRptCcy;

    @Column(name = "n_rw_amount_rpt_ccy", precision = 20, scale = 5)
    private BigDecimal rwAmountRptCcy;

    @Column(name = "n_calc_id")
    private Integer calcId;

    @Column(name = "v_reportable_currency", length = 10)
    private String reportableCurrency;

    @Column(name = "n_market_value", precision = 20, scale = 5)
    private BigDecimal marketValue;

    @Column(name = "n_weighted_amount", precision = 20, scale = 5)
    private BigDecimal weightedAmount;

    public LcrReportData() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LcrReportLine getReportLine() { return reportLine; }
    public void setReportLine(LcrReportLine reportLine) { this.reportLine = reportLine; }

    public LcrSegment getSegment() { return segment; }
    public void setSegment(LcrSegment segment) { this.segment = segment; }

    public Integer getDateSkey() { return dateSkey; }
    public void setDateSkey(Integer dateSkey) { this.dateSkey = dateSkey; }

    public LocalDate getCalendarDate() { return calendarDate; }
    public void setCalendarDate(LocalDate calendarDate) { this.calendarDate = calendarDate; }

    public BigDecimal getAmountRptCcy() { return amountRptCcy; }
    public void setAmountRptCcy(BigDecimal amountRptCcy) { this.amountRptCcy = amountRptCcy; }

    public BigDecimal getRwAmountRptCcy() { return rwAmountRptCcy; }
    public void setRwAmountRptCcy(BigDecimal rwAmountRptCcy) { this.rwAmountRptCcy = rwAmountRptCcy; }

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

    public String getReportableCurrency() { return reportableCurrency; }
    public void setReportableCurrency(String reportableCurrency) { this.reportableCurrency = reportableCurrency; }

    public BigDecimal getMarketValue() { return marketValue; }
    public void setMarketValue(BigDecimal marketValue) { this.marketValue = marketValue; }

    public BigDecimal getWeightedAmount() { return weightedAmount; }
    public void setWeightedAmount(BigDecimal weightedAmount) { this.weightedAmount = weightedAmount; }
}
