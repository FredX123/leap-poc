package com.leappoc.shared.dto.lcr;

import java.time.LocalDate;

public class LcrMetricRequest {

    private String segment;
    private LocalDate startDate;
    private LocalDate endDate;

    public LcrMetricRequest() {}

    public String getSegment() { return segment; }
    public void setSegment(String segment) { this.segment = segment; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
