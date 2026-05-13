package com.leappoc.shared.dto.lcr;

import java.util.List;

public class OsfiLcrReportDto {

    private List<OsfiLcrCalculatedDataDto> calculatedData;
    private List<OsfiLcrReferenceDataDto> referenceData;
    private List<OsfiLcrAdjustmentDto> adjustments;

    public OsfiLcrReportDto() {}

    public List<OsfiLcrCalculatedDataDto> getCalculatedData() { return calculatedData; }
    public void setCalculatedData(List<OsfiLcrCalculatedDataDto> calculatedData) { this.calculatedData = calculatedData; }

    public List<OsfiLcrReferenceDataDto> getReferenceData() { return referenceData; }
    public void setReferenceData(List<OsfiLcrReferenceDataDto> referenceData) { this.referenceData = referenceData; }


    public List<OsfiLcrAdjustmentDto> getAdjustments() { return adjustments; }
    public void setAdjustments(List<OsfiLcrAdjustmentDto> adjustments) { this.adjustments = adjustments; }
}
