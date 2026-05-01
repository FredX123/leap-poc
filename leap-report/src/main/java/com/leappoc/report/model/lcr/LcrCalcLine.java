package com.leappoc.report.model.lcr;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "LCR_CALC_LINE")
public class LcrCalcLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "v_line_code", length = 10)
    private String lineCode;

    @Column(name = "v_line_name", nullable = false, length = 500)
    private String lineName;

    @Column(name = "v_section_code", length = 10)
    private String sectionCode;

    @Column(name = "v_section_name", length = 255)
    private String sectionName;

    @Column(name = "v_subsection_code", length = 10)
    private String subsectionCode;

    @Column(name = "v_subsection_name", length = 255)
    private String subsectionName;

    @Column(name = "n_weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "v_weighted_line_code", length = 10)
    private String weightedLineCode;

    @Column(name = "v_line_type", nullable = false, length = 20)
    private String lineType;

    @Column(name = "n_display_order", nullable = false)
    private Integer displayOrder;

    public LcrCalcLine() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLineCode() { return lineCode; }
    public void setLineCode(String lineCode) { this.lineCode = lineCode; }

    public String getLineName() { return lineName; }
    public void setLineName(String lineName) { this.lineName = lineName; }

    public String getSectionCode() { return sectionCode; }
    public void setSectionCode(String sectionCode) { this.sectionCode = sectionCode; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public String getSubsectionCode() { return subsectionCode; }
    public void setSubsectionCode(String subsectionCode) { this.subsectionCode = subsectionCode; }

    public String getSubsectionName() { return subsectionName; }
    public void setSubsectionName(String subsectionName) { this.subsectionName = subsectionName; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public String getWeightedLineCode() { return weightedLineCode; }
    public void setWeightedLineCode(String weightedLineCode) { this.weightedLineCode = weightedLineCode; }

    public String getLineType() { return lineType; }
    public void setLineType(String lineType) { this.lineType = lineType; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
