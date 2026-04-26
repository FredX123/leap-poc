package com.leappoc.report.model.lcr;

import jakarta.persistence.*;

@Entity
@Table(name = "LCR_REPORT_LINE_LEVEL")
public class LcrReportLineLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_line_id", nullable = false)
    private LcrReportLine reportLine;

    @Column(name = "n_level_order", nullable = false)
    private int levelOrder;

    @Column(name = "v_level_code", nullable = false, length = 10)
    private String levelCode;

    @Column(name = "v_level_desc", nullable = false, length = 255)
    private String levelDesc;

    public LcrReportLineLevel() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LcrReportLine getReportLine() { return reportLine; }
    public void setReportLine(LcrReportLine reportLine) { this.reportLine = reportLine; }

    public int getLevelOrder() { return levelOrder; }
    public void setLevelOrder(int levelOrder) { this.levelOrder = levelOrder; }

    public String getLevelCode() { return levelCode; }
    public void setLevelCode(String levelCode) { this.levelCode = levelCode; }

    public String getLevelDesc() { return levelDesc; }
    public void setLevelDesc(String levelDesc) { this.levelDesc = levelDesc; }
}
