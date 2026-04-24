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
    @JoinColumn(name = "segment_id", nullable = false)
    private LcrSegment segment;

    @Column(name = "n_date_skey", nullable = false)
    private Integer dateSkey;

    @Column(name = "d_calander_date", nullable = false)
    private LocalDate calendarDate;

    @Column(name = "n_amount_rpt_ccy", nullable = false, precision = 20, scale = 5)
    private BigDecimal amountRptCcy;

    @Column(name = "n_rw_amount_rpt_ccy", precision = 20, scale = 5)
    private BigDecimal rwAmountRptCcy;

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
}
