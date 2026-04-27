package com.leappoc.comment.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "COMMENT")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "email")
    private String email;

    @Column(name = "content", columnDefinition = "NVARCHAR(MAX)", nullable = false)
    private String content;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "v_report_type", nullable = false, length = 50)
    private String reportType;

    @Column(name = "v_line_key", nullable = false, length = 200)
    private String lineKey;

    @Column(name = "v_segment_name", length = 100)
    private String segmentName;

    @Column(name = "v_category_code", nullable = false, length = 10)
    private String categoryCode = "NONE";

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType = "COMMENT";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public Comment() {}

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isEdited() {
        return createdAt != null && updatedAt != null && updatedAt.isAfter(createdAt);
    }

    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public String getLineKey() { return lineKey; }
    public void setLineKey(String lineKey) { this.lineKey = lineKey; }

    public String getSegmentName() { return segmentName; }
    public void setSegmentName(String segmentName) { this.segmentName = segmentName; }

    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
}
