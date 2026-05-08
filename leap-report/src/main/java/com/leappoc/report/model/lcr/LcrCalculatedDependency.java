package com.leappoc.report.model.lcr;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "LCR_CALCULATED_DEPENDENCY")
public class LcrCalculatedDependency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calculated_data_id", nullable = false)
    private LcrCalculatedData calculatedData;

    @Column(name = "v_record_id", nullable = false, length = 20)
    private String recordId;

    @Column(name = "n_value", precision = 38, scale = 15)
    private BigDecimal value;

    public LcrCalculatedDependency() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LcrCalculatedData getCalculatedData() { return calculatedData; }
    public void setCalculatedData(LcrCalculatedData calculatedData) { this.calculatedData = calculatedData; }

    public String getRecordId() { return recordId; }
    public void setRecordId(String recordId) { this.recordId = recordId; }

    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
}

