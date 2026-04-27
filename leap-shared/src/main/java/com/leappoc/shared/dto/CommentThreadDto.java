package com.leappoc.shared.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class CommentThreadDto {

    private Long id;
    private String userId;
    private String displayName;
    private String email;
    private String content;
    private Long parentId;
    private String reportType;
    private String lineKey;
    private String segmentName;
    private String categoryCode;
    private String eventType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonProperty("isEdited")
    private boolean edited;

    @JsonProperty("isOwner")
    private boolean owner;

    private boolean hasReplies;

    private List<CommentThreadDto> replies = new ArrayList<>();

    public CommentThreadDto() {}

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

    public boolean isEdited() { return edited; }
    public void setEdited(boolean edited) { this.edited = edited; }

    public boolean isOwner() { return owner; }
    public void setOwner(boolean owner) { this.owner = owner; }

    public boolean isHasReplies() { return hasReplies; }
    public void setHasReplies(boolean hasReplies) { this.hasReplies = hasReplies; }

    public List<CommentThreadDto> getReplies() { return replies; }
    public void setReplies(List<CommentThreadDto> replies) { this.replies = replies; }
}
