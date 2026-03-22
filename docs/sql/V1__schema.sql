-- ============================================================
-- LEAP POC — Database Schema
-- Target: MS SQL Server Developer Edition
-- ============================================================

-- ===================== LOOKUP TABLES =====================

-- Entity Type lookup (polymorphic association registry)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ENTITY_TYPE')
CREATE TABLE ENTITY_TYPE (
    entity_type     NVARCHAR(50)    NOT NULL,
    description     NVARCHAR(255)   NOT NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_ENTITY_TYPE PRIMARY KEY (entity_type)
);
GO

-- Event Type lookup (comment, adjustment, system, etc.)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EVENT_TYPE')
CREATE TABLE EVENT_TYPE (
    event_type      NVARCHAR(50)    NOT NULL,
    description     NVARCHAR(255)   NOT NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_EVENT_TYPE PRIMARY KEY (event_type)
);
GO

-- ===================== BUDGET REPORT =====================

-- Migrate InMemoryBudgetRepository seed data to a real table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BUDGET_REPORT')
CREATE TABLE BUDGET_REPORT (
    id                  BIGINT          IDENTITY(1,1) NOT NULL,
    item_description    NVARCHAR(255)   NOT NULL,
    monthly_expenses    DECIMAL(15,2)   NOT NULL DEFAULT 0,
    monthly_budget      DECIMAL(15,2)   NOT NULL DEFAULT 0,
    created_at          DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_BUDGET_REPORT PRIMARY KEY (id)
);
GO

-- ===================== COMMENTS =====================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'COMMENT')
CREATE TABLE COMMENT (
    id              BIGINT          IDENTITY(1,1) NOT NULL,

    -- Author (Entra OID + denormalized display info)
    user_id         NVARCHAR(255)   NOT NULL,       -- Entra Object ID (OID)
    display_name    NVARCHAR(255)   NULL,
    email           NVARCHAR(255)   NULL,

    -- Content
    content         NVARCHAR(MAX)   NULL,           -- NULL for system events

    -- Threading (adjacency list)
    parent_id       BIGINT          NULL,

    -- Polymorphic entity association
    entity_type     NVARCHAR(50)    NOT NULL,
    entity_id       BIGINT          NOT NULL,

    -- Event/audit support
    event_type      NVARCHAR(50)    NOT NULL DEFAULT 'COMMENT',
    metadata        NVARCHAR(MAX)   NULL,           -- JSON payload

    -- Timestamps
    created_at      DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    updated_at      DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    deleted_at      DATETIME2       NULL,           -- soft delete

    -- Constraints
    CONSTRAINT PK_COMMENT PRIMARY KEY (id),
    CONSTRAINT FK_COMMENT_PARENT FOREIGN KEY (parent_id)
        REFERENCES COMMENT(id),
    CONSTRAINT FK_COMMENT_ENTITY_TYPE FOREIGN KEY (entity_type)
        REFERENCES ENTITY_TYPE(entity_type),
    CONSTRAINT FK_COMMENT_EVENT_TYPE FOREIGN KEY (event_type)
        REFERENCES EVENT_TYPE(event_type),
    CONSTRAINT CK_COMMENT_METADATA_JSON
        CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO

-- ===================== INDEXES =====================

-- Fast lookup: all comments for a given entity
CREATE NONCLUSTERED INDEX IX_COMMENT_ENTITY
    ON COMMENT(entity_type, entity_id)
    INCLUDE (parent_id, created_at)
    WHERE deleted_at IS NULL;
GO

-- Fast lookup: child replies of a comment
CREATE NONCLUSTERED INDEX IX_COMMENT_PARENT
    ON COMMENT(parent_id)
    WHERE deleted_at IS NULL;
GO

-- Fast lookup: comments by user
CREATE NONCLUSTERED INDEX IX_COMMENT_USER
    ON COMMENT(user_id)
    WHERE deleted_at IS NULL;
GO
