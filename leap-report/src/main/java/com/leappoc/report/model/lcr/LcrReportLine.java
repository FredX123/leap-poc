package com.leappoc.report.model.lcr;

import jakarta.persistence.*;
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

    @OneToMany(mappedBy = "reportLine", fetch = FetchType.LAZY)
    @OrderBy("levelOrder ASC")
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

    public List<LcrReportLineLevel> getLevels() { return levels; }
    public void setLevels(List<LcrReportLineLevel> levels) { this.levels = levels; }
}
