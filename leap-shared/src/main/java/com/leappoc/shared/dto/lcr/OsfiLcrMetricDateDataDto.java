package com.leappoc.shared.dto.lcr;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class OsfiLcrMetricDateDataDto {

    @JsonProperty("n_date_skey")
    private Integer dateSkey;

    @JsonProperty("d_calander_date")
    private String calendarDate;

    @JsonProperty("n_amount_rpt_ccy")
    private BigDecimal amountRptCcy;

    @JsonProperty("n_rw_amount_rpt_ccy")
    private BigDecimal rwAmountRptCcy;

    public OsfiLcrMetricDateDataDto() {}

    public Integer getDateSkey() { return dateSkey; }
    public void setDateSkey(Integer dateSkey) { this.dateSkey = dateSkey; }

    public String getCalendarDate() { return calendarDate; }
    public void setCalendarDate(String calendarDate) { this.calendarDate = calendarDate; }

    public BigDecimal getAmountRptCcy() { return amountRptCcy; }
    public void setAmountRptCcy(BigDecimal amountRptCcy) { this.amountRptCcy = amountRptCcy; }

    public BigDecimal getRwAmountRptCcy() { return rwAmountRptCcy; }
    public void setRwAmountRptCcy(BigDecimal rwAmountRptCcy) { this.rwAmountRptCcy = rwAmountRptCcy; }
}
