package com.leappoc.shared.dto.lcr;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class OsfiLcrCalculatedDataDto {

    private String recordId;
    private BigDecimal calculatedValue;
    private String type;
    private String formula;
    private BigDecimal weight;
    private List<OsfiLcrDependencyDto> dependencies;
    private BigDecimal displayValue;

    public OsfiLcrCalculatedDataDto() {}

    public String getRecordId() { return recordId; }
    public void setRecordId(String recordId) { this.recordId = recordId; }

    public BigDecimal getCalculatedValue() { return calculatedValue; }
    public void setCalculatedValue(BigDecimal calculatedValue) { this.calculatedValue = calculatedValue; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getFormula() { return formula; }
    public void setFormula(String formula) { this.formula = formula; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public List<OsfiLcrDependencyDto> getDependencies() { return dependencies; }
    public void setDependencies(List<OsfiLcrDependencyDto> dependencies) { this.dependencies = dependencies; }

    public BigDecimal getDisplayValue() { return displayValue; }
    public void setDisplayValue(BigDecimal displayValue) { this.displayValue = displayValue; }
}

