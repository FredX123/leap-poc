package com.leappoc.report.model.lcr;

import jakarta.persistence.*;

@Entity
@Table(name = "LCR_SEGMENT")
public class LcrSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "n_segment_order", nullable = false)
    private Integer segmentOrder;

    @Column(name = "v_segment_name", nullable = false, length = 100)
    private String segmentName;

    public LcrSegment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSegmentOrder() { return segmentOrder; }
    public void setSegmentOrder(Integer segmentOrder) { this.segmentOrder = segmentOrder; }

    public String getSegmentName() { return segmentName; }
    public void setSegmentName(String segmentName) { this.segmentName = segmentName; }
}
