package com.leappoc.shared.dto.lcr;

import java.time.LocalDate;

public class LcrDateRequest {

    private LocalDate startDate;
    private LocalDate endDate;

    public LcrDateRequest() {}

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
