package com.leappoc.shared.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateCommentRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 4000, message = "Content must not exceed 4000 characters")
    private String content;

    @Size(max = 50, message = "Category code must not exceed 50 characters")
    private String categoryCode;

    public UpdateCommentRequest() {}

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }
}
