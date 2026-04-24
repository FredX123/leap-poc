package com.leappoc.report.model.lcr;

import jakarta.persistence.*;

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

    @Column(name = "v_report_line_level_code_01", nullable = false, length = 10)
    private String reportLineLevelCode01;

    @Column(name = "v_report_line_level_desc_01", nullable = false, length = 255)
    private String reportLineLevelDesc01;

    @Column(name = "v_report_line_level_code_02", nullable = false, length = 10)
    private String reportLineLevelCode02;

    @Column(name = "v_report_line_level_desc_02", nullable = false, length = 255)
    private String reportLineLevelDesc02;

    @Column(name = "v_report_line_code", nullable = false, length = 10)
    private String reportLineCode;

    @Column(name = "v_report_line_name", nullable = false, length = 500)
    private String reportLineName;

    public LcrReportLine() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReportCode() { return reportCode; }
    public void setReportCode(String reportCode) { this.reportCode = reportCode; }

    public String getParaCode() { return paraCode; }
    public void setParaCode(String paraCode) { this.paraCode = paraCode; }

    public String getReportLineLevelCode01() { return reportLineLevelCode01; }
    public void setReportLineLevelCode01(String reportLineLevelCode01) { this.reportLineLevelCode01 = reportLineLevelCode01; }

    public String getReportLineLevelDesc01() { return reportLineLevelDesc01; }
    public void setReportLineLevelDesc01(String reportLineLevelDesc01) { this.reportLineLevelDesc01 = reportLineLevelDesc01; }

    public String getReportLineLevelCode02() { return reportLineLevelCode02; }
    public void setReportLineLevelCode02(String reportLineLevelCode02) { this.reportLineLevelCode02 = reportLineLevelCode02; }

    public String getReportLineLevelDesc02() { return reportLineLevelDesc02; }
    public void setReportLineLevelDesc02(String reportLineLevelDesc02) { this.reportLineLevelDesc02 = reportLineLevelDesc02; }

    public String getReportLineCode() { return reportLineCode; }
    public void setReportLineCode(String reportLineCode) { this.reportLineCode = reportLineCode; }

    public String getReportLineName() { return reportLineName; }
    public void setReportLineName(String reportLineName) { this.reportLineName = reportLineName; }
}
