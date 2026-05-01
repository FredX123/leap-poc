-- ============================================================
-- V6 — LCR Calculated Report Tables (New LCR_REPORT type)
-- Target: MS SQL Server Developer Edition
-- ============================================================
--
-- Design notes:
-- 1. LCR_CALC_LINE: Line definitions with section hierarchy, weight, and
--    weighted code mapping. Each row represents either a data line (with code)
--    or a section/subsection header (label-only, no code).
-- 2. LCR_CALC_DATA: Calculated amounts per calculation, line, and currency.
--    Stores both market value and weighted amount.
-- 3. LCR_CALC_ADJUSTMENT: User adjustments (overrides) to amounts.
--    When adjustments exist, the UI shows adjusted values.
-- ============================================================

-- ===================== LCR_CALC_LINE (dimension) =====================
-- Stores line definitions for the calculated LCR report.
-- Lines with v_line_code are data rows; lines without are section headers.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_CALC_LINE')
CREATE TABLE LCR_CALC_LINE (
    id                      BIGINT          IDENTITY(1,1) NOT NULL,
    v_line_code             NVARCHAR(10)    NULL,           -- e.g. '11001' (NULL for section headers)
    v_line_name             NVARCHAR(500)   NOT NULL,       -- e.g. 'Coins and banknotes'
    v_section_code          NVARCHAR(10)    NULL,           -- e.g. '10' (top-level section grouping)
    v_section_name          NVARCHAR(255)   NULL,           -- e.g. '1. Stock of High Quality Liquid Assets (HQLA)'
    v_subsection_code       NVARCHAR(10)    NULL,           -- e.g. '110' (subsection grouping)
    v_subsection_name       NVARCHAR(255)   NULL,           -- e.g. '1.1. Level 1 assets'
    n_weight                DECIMAL(5,2)    NULL,           -- weight factor (e.g. 1.00, 0.85)
    v_weighted_line_code    NVARCHAR(10)    NULL,           -- e.g. '61001' (code for weighted column)
    v_line_type             NVARCHAR(20)    NOT NULL DEFAULT 'data',  -- 'section', 'subsection', 'subheader', 'data'
    n_display_order         INT             NOT NULL,       -- ordering for display
    CONSTRAINT PK_LCR_CALC_LINE PRIMARY KEY (id)
);
GO

-- ===================== LCR_CALC_DATA (fact) =====================
-- Stores calculated amounts per calculation ID, line, and currency.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_CALC_DATA')
CREATE TABLE LCR_CALC_DATA (
    id                      BIGINT          IDENTITY(1,1) NOT NULL,
    n_calc_id               INT             NOT NULL,       -- calculation ID (e.g. 6059)
    line_id                 BIGINT          NOT NULL,       -- FK to LCR_CALC_LINE
    v_reportable_currency   NVARCHAR(10)    NOT NULL,       -- 'ALL', 'CAD', 'USD', etc.
    n_market_value          DECIMAL(20,5)   NULL,           -- market value amount
    n_weighted_amount       DECIMAL(20,5)   NULL,           -- weighted amount (market_value * weight)
    d_reporting_date        DATE            NOT NULL,       -- reporting date
    CONSTRAINT PK_LCR_CALC_DATA PRIMARY KEY (id),
    CONSTRAINT FK_LCR_CALC_DATA_LINE FOREIGN KEY (line_id) REFERENCES LCR_CALC_LINE(id),
    CONSTRAINT UQ_LCR_CALC_DATA UNIQUE (n_calc_id, line_id, v_reportable_currency, d_reporting_date)
);
GO

-- ===================== LCR_CALC_ADJUSTMENT (user adjustments) =====================
-- Stores user overrides/adjustments to calculated amounts.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_CALC_ADJUSTMENT')
CREATE TABLE LCR_CALC_ADJUSTMENT (
    id                      BIGINT          IDENTITY(1,1) NOT NULL,
    n_calc_id               INT             NOT NULL,       -- calculation ID
    line_id                 BIGINT          NOT NULL,       -- FK to LCR_CALC_LINE
    v_reportable_currency   NVARCHAR(10)    NOT NULL,       -- currency
    n_adjusted_market_value DECIMAL(20,5)   NULL,           -- adjusted market value
    n_adjusted_weighted_amount DECIMAL(20,5) NULL,          -- adjusted weighted amount
    v_reason                NVARCHAR(500)   NULL,           -- reason for adjustment
    v_created_by            NVARCHAR(100)   NOT NULL,       -- user who created
    dt_created_at           DATETIME2       NOT NULL DEFAULT GETUTCDATE(),
    v_updated_by            NVARCHAR(100)   NULL,           -- user who last updated
    dt_updated_at           DATETIME2       NULL,
    CONSTRAINT PK_LCR_CALC_ADJUSTMENT PRIMARY KEY (id),
    CONSTRAINT FK_LCR_CALC_ADJ_LINE FOREIGN KEY (line_id) REFERENCES LCR_CALC_LINE(id),
    CONSTRAINT UQ_LCR_CALC_ADJUSTMENT UNIQUE (n_calc_id, line_id, v_reportable_currency)
);
GO

-- ===================== INDEXES =====================

CREATE NONCLUSTERED INDEX IX_LCR_CALC_LINE_CODE
    ON LCR_CALC_LINE (v_line_code) WHERE v_line_code IS NOT NULL;
GO

CREATE NONCLUSTERED INDEX IX_LCR_CALC_LINE_ORDER
    ON LCR_CALC_LINE (n_display_order);
GO

CREATE NONCLUSTERED INDEX IX_LCR_CALC_DATA_CALC_DATE
    ON LCR_CALC_DATA (n_calc_id, d_reporting_date);
GO

CREATE NONCLUSTERED INDEX IX_LCR_CALC_DATA_CURRENCY
    ON LCR_CALC_DATA (v_reportable_currency);
GO

CREATE NONCLUSTERED INDEX IX_LCR_CALC_ADJ_CALC
    ON LCR_CALC_ADJUSTMENT (n_calc_id, line_id);
GO

-- ===================== Add report type for comments =====================

IF NOT EXISTS (SELECT 1 FROM REPORT_TYPE WHERE v_report_type = 'LCR_REPORT')
INSERT INTO REPORT_TYPE (v_report_type, v_description) VALUES
    ('LCR_REPORT', 'LCR Calculated Report');
GO
