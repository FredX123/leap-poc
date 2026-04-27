-- ============================================================
-- V4 — Comment System Redesign for LCR Reports
-- Target: MS SQL Server Developer Edition
-- ============================================================
--
-- Design notes:
-- 1. DROP old ENTITY_TYPE/EVENT_TYPE lookup tables and old COMMENT/BUDGET_REPORT tables.
-- 2. New COMMENT table uses a composite natural key (report_type + v_line_key + v_segment_name)
--    to associate comments with any tree row — both stored leaf lines and virtual parent lines.
--    v_line_key is a pipe-delimited level-code path, e.g.:
--      "10"           → level-1 group "High Quality Liquid Asset"
--      "10|110"       → level-2 group "Cash & Cash Equivalents"
--      "10|110|11001" → leaf line "Coins and banknotes"
--    This matches the composite keys the frontend already builds.
-- 3. COMMENT_CATEGORY lookup stores driver/category options for root-level comments.
-- 4. REPORT_TYPE lookup enumerates the supported report types.
-- ============================================================

-- ===================== DROP OLD TABLES =====================

-- Drop old COMMENT table first (has FKs to ENTITY_TYPE, EVENT_TYPE)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'COMMENT')
    DROP TABLE COMMENT;
GO

-- Drop old lookup tables
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'ENTITY_TYPE')
    DROP TABLE ENTITY_TYPE;
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'EVENT_TYPE')
    DROP TABLE EVENT_TYPE;
GO

-- Drop old BUDGET_REPORT table (no longer needed)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'BUDGET_REPORT')
    DROP TABLE BUDGET_REPORT;
GO

-- ===================== REPORT_TYPE (lookup) =====================
-- Enumerates the report types that support commenting.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'REPORT_TYPE')
CREATE TABLE REPORT_TYPE (
    v_report_type   NVARCHAR(50)    NOT NULL,
    v_description   NVARCHAR(255)   NOT NULL,
    created_at      DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_REPORT_TYPE PRIMARY KEY (v_report_type)
);
GO

INSERT INTO REPORT_TYPE (v_report_type, v_description) VALUES
    ('OSFI_LCR_REPORT',        'OSFI LCR Report'),
    ('OSFI_LCR_METRIC_REPORT', 'OSFI LCR Metric Report');
GO

-- ===================== COMMENT_CATEGORY (lookup) =====================
-- Driver/category options for root-level comments.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'COMMENT_CATEGORY')
CREATE TABLE COMMENT_CATEGORY (
    v_category_code NVARCHAR(10)    NOT NULL,
    v_category_name NVARCHAR(100)   NOT NULL,
    n_sort_order    INT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_COMMENT_CATEGORY PRIMARY KEY (v_category_code)
);
GO

INSERT INTO COMMENT_CATEGORY (v_category_code, v_category_name, n_sort_order) VALUES
    ('NONE', N'— No driver —',            0),
    ('MAT',  N'Maturity rollover',         1),
    ('SSN',  N'Seasonality',               2),
    ('WIN',  N'Client win / inflow',       3),
    ('LOSS', N'Client loss / outflow',     4),
    ('RATE', N'Rate repricing',            5),
    ('CORP', N'Corporate action',          6),
    ('FIX',  N'Data correction',           7),
    ('OP',   N'Operational balance shift', 8),
    ('REG',  N'Regulatory change',         9),
    ('OTH',  N'Other (see notes)',        10);
GO

-- ===================== COMMENT (redesigned) =====================
-- Stores comments for any report line (leaf or parent) per segment.
--
-- Key columns:
--   v_report_type   — which report (FK to REPORT_TYPE)
--   v_line_key      — pipe-delimited level path identifying the row, e.g. "10|110|11001"
--   v_segment_name  — segment name, e.g. "Enterprise", "CA Retail"
--                     NULL for OSFI_LCR_REPORT (single-segment, no segment dimension)
--   v_category_code — driver category (only on root comments; replies inherit parent's)
--   parent_id       — threading (adjacency list: NULL = root comment, non-NULL = reply)
--   event_type      — 'COMMENT' or 'REPLY'

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'COMMENT')
CREATE TABLE COMMENT (
    id                  BIGINT          IDENTITY(1,1) NOT NULL,

    -- Author (Entra OID + denormalized display info)
    user_id             NVARCHAR(255)   NOT NULL,
    display_name        NVARCHAR(255)   NULL,
    email               NVARCHAR(255)   NULL,

    -- Content
    content             NVARCHAR(MAX)   NOT NULL,

    -- Threading (adjacency list)
    parent_id           BIGINT          NULL,

    -- Report line association (composite natural key)
    v_report_type       NVARCHAR(50)    NOT NULL,
    v_line_key          NVARCHAR(200)   NOT NULL,       -- e.g. "10|110|11001"
    v_segment_name      NVARCHAR(100)   NULL,           -- NULL when report has no segment dimension

    -- Driver category (root comments only; replies leave as NULL or 'NONE')
    v_category_code     NVARCHAR(10)    NOT NULL DEFAULT 'NONE',

    -- Event type
    event_type          NVARCHAR(50)    NOT NULL DEFAULT 'COMMENT',

    -- Timestamps
    created_at          DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    deleted_at          DATETIME2       NULL,           -- soft delete

    -- Constraints
    CONSTRAINT PK_COMMENT PRIMARY KEY (id),
    CONSTRAINT FK_COMMENT_PARENT FOREIGN KEY (parent_id)
        REFERENCES COMMENT(id),
    CONSTRAINT FK_COMMENT_REPORT_TYPE FOREIGN KEY (v_report_type)
        REFERENCES REPORT_TYPE(v_report_type),
    CONSTRAINT FK_COMMENT_CATEGORY FOREIGN KEY (v_category_code)
        REFERENCES COMMENT_CATEGORY(v_category_code),
    CONSTRAINT CK_COMMENT_EVENT_TYPE
        CHECK (event_type IN ('COMMENT', 'REPLY'))
);
GO

-- ===================== INDEXES =====================

-- Primary lookup: all comments for a specific report line + segment
CREATE NONCLUSTERED INDEX IX_COMMENT_REPORT_LINE
    ON COMMENT(v_report_type, v_line_key, v_segment_name)
    INCLUDE (parent_id, v_category_code, created_at)
    WHERE deleted_at IS NULL;
GO

-- Threading: child replies of a comment
CREATE NONCLUSTERED INDEX IX_COMMENT_PARENT
    ON COMMENT(parent_id)
    WHERE deleted_at IS NULL;
GO

-- User's comments across all reports
CREATE NONCLUSTERED INDEX IX_COMMENT_USER
    ON COMMENT(user_id, created_at)
    WHERE deleted_at IS NULL;
GO

-- ===================== SAMPLE COMMENTS =====================
-- Sample data for UI development (uses placeholder Entra OIDs)

-- Root comment on OSFI LCR Metric, level-1 group "High Quality Liquid Asset", Enterprise segment
INSERT INTO COMMENT (user_id, display_name, email, content, parent_id,
                     v_report_type, v_line_key, v_segment_name, v_category_code, event_type)
VALUES
    ('2ce33691-a662-434b-8676-55a3fc6799ef', 'POC Admin 1', 'admin1@leappoc.mock',
     'HQLA dropped significantly this period — is this due to maturity rollover?',
     NULL, 'OSFI_LCR_METRIC_REPORT', '10', 'Enterprise', 'MAT', 'COMMENT');

-- Reply to the above
INSERT INTO COMMENT (user_id, display_name, email, content, parent_id,
                     v_report_type, v_line_key, v_segment_name, v_category_code, event_type)
VALUES
    ('deaa7af4-ef97-4ebe-8cf3-10bb52bcdc3b', 'POC Writer 1', 'write1@leappoc.mock',
     'Yes, a large block of government bonds matured on Jan 29. Reinvestment is in progress.',
     1, 'OSFI_LCR_METRIC_REPORT', '10', 'Enterprise', 'NONE', 'REPLY');

-- Root comment on a leaf line in OSFI LCR Report, segment "Enterprise"
INSERT INTO COMMENT (user_id, display_name, email, content, parent_id,
                     v_report_type, v_line_key, v_segment_name, v_category_code, event_type)
VALUES
    ('de62386a-6618-40b9-94c6-4d04260942bc', 'POC Writer 2', 'write2@leappoc.mock',
     'Cash & Cash Equivalents variance looks off — data correction needed?',
     NULL, 'OSFI_LCR_REPORT', '10|110|11001', 'Enterprise', 'FIX', 'COMMENT');

-- Root comment on OSFI LCR Metric, CA Retail segment, level-2 group
INSERT INTO COMMENT (user_id, display_name, email, content, parent_id,
                     v_report_type, v_line_key, v_segment_name, v_category_code, event_type)
VALUES
    ('2f2c9530-a002-4b59-8776-7ee1cd56e5a5', 'POC Writer 1', 'write1@leappoc.mock',
     'CA Retail showing unexpected inflow — is this a new client win?',
     NULL, 'OSFI_LCR_METRIC_REPORT', '10|110', 'CA Retail', 'WIN', 'COMMENT');
GO
