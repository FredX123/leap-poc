package com.leappoc.report.model.lcr;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "LCR_CALCULATED_DATA")
public class LcrCalculatedData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "n_calc_id", nullable = false)
    private Integer calcId;

    @Column(name = "v_record_id", nullable = false, length = 20)
    private String recordId;

    @Column(name = "n_calculated_value", precision = 38, scale = 15)
    private BigDecimal calculatedValue;

    @Column(name = "v_type", nullable = false, length = 20)
    private String type;

    @Column(name = "v_formula", length = 500)
    private String formula;

    @Column(name = "n_weight", precision = 10, scale = 5)
    private BigDecimal weight;

    @Column(name = "n_display_value", precision = 38, scale = 15)
    private BigDecimal displayValue;

    @OneToMany(mappedBy = "calculatedData", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<LcrCalculatedDependency> dependencies = new ArrayList<>();

    public LcrCalculatedData() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getCalcId() { return calcId; }
    public void setCalcId(Integer calcId) { this.calcId = calcId; }

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

    public BigDecimal getDisplayValue() { return displayValue; }
    public void setDisplayValue(BigDecimal displayValue) { this.displayValue = displayValue; }

    public List<LcrCalculatedDependency> getDependencies() { return dependencies; }
    public void setDependencies(List<LcrCalculatedDependency> dependencies) { this.dependencies = dependencies; }
}

