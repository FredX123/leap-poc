-- ============================================================
-- LEAP POC — Consolidated Database Schema (DDL Only)
-- Target: MS SQL Server Developer Edition
-- ============================================================
-- This file represents the final schema state after all migrations.
-- Tables: REPORT_TYPE, COMMENT_DRIVER, COMMENT,
--         LCR_REPORT_LINE, LCR_REPORT_LINE_LEVEL, LCR_SEGMENT,
--         LCR_REPORT_DATA, LCR_CALC_ADJUSTMENT,
--         LCR_CALCULATED_DATA, LCR_CALCULATED_DEPENDENCY, LCR_REFERENCE_DATA
-- ============================================================


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


-- ===================== COMMENT_DRIVER (lookup) =====================
-- Driver options for root-level comments.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'COMMENT_DRIVER')
CREATE TABLE COMMENT_DRIVER (
    v_driver_code   NVARCHAR(10)    NOT NULL,
    v_driver_name   NVARCHAR(100)   NOT NULL,
    n_sort_order    INT             NOT NULL DEFAULT 0,
    created_at      DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT PK_COMMENT_DRIVER PRIMARY KEY (v_driver_code)
);
GO


-- ===================== COMMENT =====================
-- Stores comments for any report line (leaf or parent) per segment.
--
-- Key columns:
--   v_report_type   — which report (FK to REPORT_TYPE)
--   v_line_key      — pipe-delimited level path identifying the row, e.g. "10|110|11001"
--   v_segment_name  — segment name, e.g. "Enterprise", "CA Retail"
--                     NULL for reports with no segment dimension
--   v_driver_code — driver (only on root comments; replies use 'NONE')
--   parent_id       — threading (adjacency list: NULL = root, non-NULL = reply)
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
    v_line_key          NVARCHAR(200)   NOT NULL,
    v_segment_name      NVARCHAR(100)   NULL,

    -- Driver
    v_driver_code       NVARCHAR(10)    NOT NULL DEFAULT 'NONE',

    -- Event type
    event_type          NVARCHAR(50)    NOT NULL DEFAULT 'COMMENT',

    -- Timestamps
    created_at          DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    updated_at          DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    deleted_at          DATETIME2       NULL,

    -- Constraints
    CONSTRAINT PK_COMMENT PRIMARY KEY (id),
    CONSTRAINT FK_COMMENT_PARENT FOREIGN KEY (parent_id)
        REFERENCES COMMENT(id),
    CONSTRAINT FK_COMMENT_REPORT_TYPE FOREIGN KEY (v_report_type)
        REFERENCES REPORT_TYPE(v_report_type),
    CONSTRAINT FK_COMMENT_DRIVER FOREIGN KEY (v_driver_code)
        REFERENCES COMMENT_DRIVER(v_driver_code),
    CONSTRAINT CK_COMMENT_EVENT_TYPE
        CHECK (event_type IN ('COMMENT', 'REPLY'))
);
GO


-- ===================== LCR_REPORT_LINE (dimension) =====================
-- Line definitions for all report types (OSFI_LCR, OSFI_LCR_METRIC).
-- Lines with v_line_type = 'data' are data rows; 'section'/'subsection'/'subheader' are headers.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_REPORT_LINE')
CREATE TABLE LCR_REPORT_LINE (
    id                      BIGINT          IDENTITY(1,1) NOT NULL,
    v_report_code           NVARCHAR(50)    NOT NULL,
    v_para_code             NVARCHAR(50)    NOT NULL DEFAULT '',
    v_report_line_code      NVARCHAR(10)    NOT NULL,
    v_report_line_name      NVARCHAR(500)   NOT NULL,
    n_weight                DECIMAL(5,2)    NULL,
    v_weighted_line_code    NVARCHAR(10)    NULL,
    v_line_type             NVARCHAR(20)    NULL,
    n_display_order         INT             NULL,
    CONSTRAINT PK_LCR_REPORT_LINE PRIMARY KEY (id),
    CONSTRAINT UQ_LCR_REPORT_LINE UNIQUE (v_report_code, v_para_code, v_report_line_code)
);
GO


-- ===================== LCR_REPORT_LINE_LEVEL (hierarchy) =====================
-- Each row represents one level in the hierarchy for a report line.
-- n_level_order determines the depth (1 = top, 2 = next, ...).

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_REPORT_LINE_LEVEL')
CREATE TABLE LCR_REPORT_LINE_LEVEL (
    id              BIGINT          IDENTITY(1,1) NOT NULL,
    report_line_id  BIGINT          NOT NULL,
    n_level_order   INT             NOT NULL,
    v_level_code    NVARCHAR(10)    NOT NULL,
    v_level_desc    NVARCHAR(255)   NOT NULL,
    CONSTRAINT PK_LCR_REPORT_LINE_LEVEL PRIMARY KEY (id),
    CONSTRAINT FK_LCR_LINE_LEVEL_LINE FOREIGN KEY (report_line_id)
        REFERENCES LCR_REPORT_LINE(id),
    CONSTRAINT UQ_LCR_LINE_LEVEL UNIQUE (report_line_id, n_level_order)
);
GO


-- ===================== LCR_SEGMENT (dimension) =====================
-- Segments: Enterprise, CA Retail, Wholesale, US Retail.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_SEGMENT')
CREATE TABLE LCR_SEGMENT (
    id              BIGINT          IDENTITY(1,1) NOT NULL,
    n_segment_order INT             NOT NULL,
    v_segment_name  NVARCHAR(100)   NOT NULL,
    CONSTRAINT PK_LCR_SEGMENT PRIMARY KEY (id),
    CONSTRAINT UQ_LCR_SEGMENT_NAME UNIQUE (v_segment_name)
);
GO


-- ===================== LCR_REPORT_DATA (fact) =====================
-- Stores amount data for all report types.
-- OSFI_LCR_METRIC uses: segment_id, n_date_skey, d_calander_date, n_amount_rpt_ccy, n_rw_amount_rpt_ccy
-- OSFI_LCR uses: n_calc_id, v_reportable_currency, d_calander_date, n_market_value, n_weighted_amount

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_REPORT_DATA')
CREATE TABLE LCR_REPORT_DATA (
    id                      BIGINT          IDENTITY(1,1) NOT NULL,
    report_line_id          BIGINT          NOT NULL,

    -- OSFI_LCR_METRIC report columns
    segment_id              BIGINT          NULL,
    n_date_skey             INT             NOT NULL,
    d_calander_date         DATE            NOT NULL,
    n_amount_rpt_ccy        DECIMAL(20,5)   NULL,
    n_rw_amount_rpt_ccy     DECIMAL(20,5)   NULL,

    -- OSFI_LCR report columns
    n_calc_id               INT             NULL,
    v_reportable_currency   NVARCHAR(10)    NULL,
    n_market_value          DECIMAL(20,5)   NULL,
    n_weighted_amount       DECIMAL(20,5)   NULL,

    CONSTRAINT PK_LCR_REPORT_DATA PRIMARY KEY (id),
    CONSTRAINT FK_LCR_DATA_REPORT_LINE FOREIGN KEY (report_line_id)
        REFERENCES LCR_REPORT_LINE(id),
    CONSTRAINT FK_LCR_DATA_SEGMENT FOREIGN KEY (segment_id)
        REFERENCES LCR_SEGMENT(id)
);
GO


-- ===================== LCR_CALC_ADJUSTMENT (user adjustments) =====================
-- Stores user adjustment deltas to OSFI LCR report market values.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_CALC_ADJUSTMENT')
CREATE TABLE LCR_CALC_ADJUSTMENT (
    id                      BIGINT          IDENTITY(1,1) NOT NULL,
    n_calc_id               INT             NOT NULL,
    line_id                 BIGINT          NOT NULL,
    v_reportable_currency   NVARCHAR(10)    NOT NULL,
    n_adjustment_value      DECIMAL(20,5)   NOT NULL DEFAULT 0,
    v_comment               NVARCHAR(500)   NOT NULL DEFAULT '',
    v_created_by            NVARCHAR(100)   NOT NULL,
    dt_created_at           DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    v_updated_by            NVARCHAR(100)   NULL,
    dt_updated_at           DATETIME2       NULL,
    CONSTRAINT PK_LCR_CALC_ADJUSTMENT PRIMARY KEY (id),
    CONSTRAINT FK_LCR_CALC_ADJ_REPORT_LINE FOREIGN KEY (line_id)
        REFERENCES LCR_REPORT_LINE(id),
    CONSTRAINT UQ_LCR_CALC_ADJUSTMENT UNIQUE (n_calc_id, line_id, v_reportable_currency)
);
GO


-- ===================== LCR_CALCULATED_DATA =====================
-- Stores calculatedData from OSFI LCR report (formula-based computed records).

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_CALCULATED_DATA')
CREATE TABLE LCR_CALCULATED_DATA (
    id                  BIGINT          IDENTITY(1,1) NOT NULL,
    n_calc_id           INT             NOT NULL,
    v_record_id         NVARCHAR(20)    NOT NULL,
    n_calculated_value  DECIMAL(38,15)  NULL,
    v_type              NVARCHAR(20)    NOT NULL,
    v_formula           NVARCHAR(500)   NULL,
    n_weight            DECIMAL(10,5)   NULL,
    n_display_value     DECIMAL(38,15)  NULL,
    CONSTRAINT PK_LCR_CALCULATED_DATA PRIMARY KEY (id),
    CONSTRAINT UQ_LCR_CALCULATED_DATA UNIQUE (n_calc_id, v_record_id)
);
GO


-- ===================== LCR_CALCULATED_DEPENDENCY =====================
-- Stores dependencies for each calculatedData record.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_CALCULATED_DEPENDENCY')
CREATE TABLE LCR_CALCULATED_DEPENDENCY (
    id                      BIGINT          IDENTITY(1,1) NOT NULL,
    calculated_data_id      BIGINT          NOT NULL,
    v_record_id             NVARCHAR(20)    NOT NULL,
    n_value                 DECIMAL(38,15)  NULL,
    CONSTRAINT PK_LCR_CALCULATED_DEPENDENCY PRIMARY KEY (id),
    CONSTRAINT FK_LCR_CALC_DEP_DATA FOREIGN KEY (calculated_data_id)
        REFERENCES LCR_CALCULATED_DATA(id)
);
GO


-- ===================== LCR_REFERENCE_DATA =====================
-- Stores referenceData (drill-down/source rows) from OSFI LCR report.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_REFERENCE_DATA')
CREATE TABLE LCR_REFERENCE_DATA (
    id                          BIGINT          IDENTITY(1,1) NOT NULL,
    n_calc_id                   INT             NOT NULL,
    n_reporting_row             INT             NOT NULL,
    v_product_class_result      NVARCHAR(500)   NOT NULL,
    v_reporting_type_amount     NVARCHAR(200)   NOT NULL,
    v_original_currency         NVARCHAR(10)    NOT NULL,
    n_original_amount           DECIMAL(38,15)  NULL,
    v_reporting_currency        NVARCHAR(10)    NOT NULL,
    n_reporting_amount          DECIMAL(38,15)  NULL,
    v_reportable_currency       NVARCHAR(10)    NULL,
    n_row_no                    INT             NULL,
    CONSTRAINT PK_LCR_REFERENCE_DATA PRIMARY KEY (id)
);
GO


-- ============================================================
-- INDEXES
-- ============================================================

-- COMMENT indexes
CREATE NONCLUSTERED INDEX IX_COMMENT_REPORT_LINE
    ON COMMENT(v_report_type, v_line_key, v_segment_name)
    INCLUDE (parent_id, v_driver_code, created_at)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_COMMENT_PARENT
    ON COMMENT(parent_id)
    WHERE deleted_at IS NULL;
GO

CREATE NONCLUSTERED INDEX IX_COMMENT_USER
    ON COMMENT(user_id, created_at)
    WHERE deleted_at IS NULL;
GO

-- LCR_REPORT_LINE indexes
CREATE NONCLUSTERED INDEX IX_LCR_REPORT_LINE_CODE
    ON LCR_REPORT_LINE (v_report_code);
GO

CREATE NONCLUSTERED INDEX IX_LCR_REPORT_LINE_DISPLAY_ORDER
    ON LCR_REPORT_LINE (n_display_order)
    WHERE n_display_order IS NOT NULL;
GO

-- LCR_REPORT_LINE_LEVEL indexes
CREATE NONCLUSTERED INDEX IX_LCR_REPORT_LINE_LEVEL_LINE
    ON LCR_REPORT_LINE_LEVEL (report_line_id);
GO

-- LCR_REPORT_DATA indexes
CREATE NONCLUSTERED INDEX IX_LCR_REPORT_DATA_DATE
    ON LCR_REPORT_DATA (d_calander_date);
GO

CREATE NONCLUSTERED INDEX IX_LCR_REPORT_DATA_LINE_DATE
    ON LCR_REPORT_DATA (report_line_id, d_calander_date);
GO

-- Filtered unique index for OSFI_LCR_METRIC reports (segment-based)
CREATE UNIQUE NONCLUSTERED INDEX UQ_LCR_REPORT_DATA_SEGMENT
    ON LCR_REPORT_DATA (report_line_id, segment_id, n_date_skey)
    WHERE segment_id IS NOT NULL;
GO

-- Filtered unique index for OSFI_LCR reports (calc-based)
CREATE UNIQUE NONCLUSTERED INDEX UQ_LCR_REPORT_DATA_CALC
    ON LCR_REPORT_DATA (report_line_id, n_calc_id, v_reportable_currency, d_calander_date)
    WHERE n_calc_id IS NOT NULL;
GO

CREATE NONCLUSTERED INDEX IX_LCR_REPORT_DATA_CALC
    ON LCR_REPORT_DATA (n_calc_id, v_reportable_currency, d_calander_date)
    WHERE n_calc_id IS NOT NULL;
GO

-- LCR_CALC_ADJUSTMENT indexes
CREATE NONCLUSTERED INDEX IX_LCR_CALC_ADJ_CALC
    ON LCR_CALC_ADJUSTMENT (n_calc_id, line_id);
GO

-- LCR_CALCULATED_DATA indexes
CREATE NONCLUSTERED INDEX IX_LCR_CALCULATED_DATA_CALC
    ON LCR_CALCULATED_DATA (n_calc_id);
GO

-- LCR_CALCULATED_DEPENDENCY indexes
CREATE NONCLUSTERED INDEX IX_LCR_CALC_DEP_DATA
    ON LCR_CALCULATED_DEPENDENCY (calculated_data_id);
GO

-- LCR_REFERENCE_DATA indexes
CREATE NONCLUSTERED INDEX IX_LCR_REFERENCE_DATA_CALC
    ON LCR_REFERENCE_DATA (n_calc_id, n_reporting_row);
GO
