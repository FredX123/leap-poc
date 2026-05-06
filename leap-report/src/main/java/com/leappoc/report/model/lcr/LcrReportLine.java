package com.leappoc.report.model.lcr;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "LCR_REPORT_LINE")
public class LcrReportLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "v_report_code", nullable = false, length = 50)
    private String reportCode;

    @Column(name = "v_para_code", nullable = false, length = 50)
    private String paraCode;

    @Column(name = "v_report_line_code", nullable = false, length = 10)
    private String reportLineCode;

    @Column(name = "v_report_line_name", nullable = false, length = 500)
    private String reportLineName;

    @Column(name = "n_weight", precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(name = "v_weighted_line_code", length = 10)
    private String weightedLineCode;

    @Column(name = "v_line_type", length = 20)
    private String lineType;

    @Column(name = "n_display_order")
    private Integer displayOrder;

    @OneToMany(mappedBy = "reportLine", fetch = FetchType.LAZY)
    @OrderBy("levelOrder ASC")
    @BatchSize(size = 50)
    private List<LcrReportLineLevel> levels = new ArrayList<>();

    public LcrReportLine() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReportCode() { return reportCode; }
    public void setReportCode(String reportCode) { this.reportCode = reportCode; }

    public String getParaCode() { return paraCode; }
    public void setParaCode(String paraCode) { this.paraCode = paraCode; }

    public String getReportLineCode() { return reportLineCode; }
    public void setReportLineCode(String reportLineCode) { this.reportLineCode = reportLineCode; }

    public String getReportLineName() { return reportLineName; }
    public void setReportLineName(String reportLineName) { this.reportLineName = reportLineName; }

    public BigDecimal getWeight() { return weight; }
    public void setWeight(BigDecimal weight) { this.weight = weight; }

    public String getWeightedLineCode() { return weightedLineCode; }
    public void setWeightedLineCode(String weightedLineCode) { this.weightedLineCode = weightedLineCode; }

    public String getLineType() { return lineType; }
    public void setLineType(String lineType) { this.lineType = lineType; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public List<LcrReportLineLevel> getLevels() { return levels; }
    public void setLevels(List<LcrReportLineLevel> levels) { this.levels = levels; }
}
