-- ============================================================
-- LCR Report Tables — OSFI LCR & OSFI LCR Metric
-- Target: MS SQL Server Developer Edition
-- ============================================================

-- ===================== LCR REPORT LINE (dimension) =====================
-- Stores report line definitions for both OSFI_LCR and OSFI_LCR_METRIC.
-- Same v_report_line_code may appear under different v_report_code with
-- different descriptions.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_REPORT_LINE')
CREATE TABLE LCR_REPORT_LINE (
    id                              BIGINT          IDENTITY(1,1) NOT NULL,
    v_report_code                   NVARCHAR(50)    NOT NULL,       -- 'OSFI_LCR' or 'OSFI_LCR_METRIC'
    v_para_code                     NVARCHAR(50)    NOT NULL,       -- e.g. '43(a)', '43(b)'
    v_report_line_level_code_01     NVARCHAR(10)    NOT NULL,       -- e.g. '10'
    v_report_line_level_desc_01     NVARCHAR(255)   NOT NULL,       -- e.g. '1. Stock of high quality liquid assets (HQLA)'
    v_report_line_level_code_02     NVARCHAR(10)    NOT NULL,       -- e.g. '110'
    v_report_line_level_desc_02     NVARCHAR(255)   NOT NULL,       -- e.g. '1.1. Level 1 assets'
    v_report_line_code              NVARCHAR(10)    NOT NULL,       -- e.g. '11001'
    v_report_line_name              NVARCHAR(500)   NOT NULL,       -- e.g. 'Coins and banknotes'
    CONSTRAINT PK_LCR_REPORT_LINE PRIMARY KEY (id),
    CONSTRAINT UQ_LCR_REPORT_LINE UNIQUE (v_report_code, v_report_line_code)
);
GO

-- ===================== LCR SEGMENT (dimension) =====================
-- Stores segments: Enterprise, CA Retail, Wholesale, US Retail.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_SEGMENT')
CREATE TABLE LCR_SEGMENT (
    id                  BIGINT          IDENTITY(1,1) NOT NULL,
    n_segment_order     INT             NOT NULL,
    v_segment_name      NVARCHAR(100)   NOT NULL,
    CONSTRAINT PK_LCR_SEGMENT PRIMARY KEY (id),
    CONSTRAINT UQ_LCR_SEGMENT_NAME UNIQUE (v_segment_name)
);
GO

-- ===================== LCR REPORT DATA (fact) =====================
-- Stores the amount data per report line, segment, and date.
-- n_rw_amount_rpt_ccy is populated for OSFI_LCR_METRIC lines,
-- NULL for OSFI_LCR lines.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LCR_REPORT_DATA')
CREATE TABLE LCR_REPORT_DATA (
    id                      BIGINT          IDENTITY(1,1) NOT NULL,
    report_line_id          BIGINT          NOT NULL,
    segment_id              BIGINT          NOT NULL,
    n_date_skey             INT             NOT NULL,       -- e.g. 20260129
    d_calander_date         DATE            NOT NULL,       -- e.g. '2026-01-29'
    n_amount_rpt_ccy        DECIMAL(20,5)   NOT NULL DEFAULT 0,
    n_rw_amount_rpt_ccy     DECIMAL(20,5)   NULL,
    CONSTRAINT PK_LCR_REPORT_DATA PRIMARY KEY (id),
    CONSTRAINT FK_LCR_DATA_REPORT_LINE FOREIGN KEY (report_line_id) REFERENCES LCR_REPORT_LINE(id),
    CONSTRAINT FK_LCR_DATA_SEGMENT FOREIGN KEY (segment_id) REFERENCES LCR_SEGMENT(id),
    CONSTRAINT UQ_LCR_REPORT_DATA UNIQUE (report_line_id, segment_id, n_date_skey)
);
GO

-- ===================== INDEXES =====================

CREATE NONCLUSTERED INDEX IX_LCR_REPORT_LINE_CODE
    ON LCR_REPORT_LINE (v_report_code);
GO

CREATE NONCLUSTERED INDEX IX_LCR_REPORT_DATA_DATE
    ON LCR_REPORT_DATA (d_calander_date);
GO

CREATE NONCLUSTERED INDEX IX_LCR_REPORT_DATA_LINE_DATE
    ON LCR_REPORT_DATA (report_line_id, d_calander_date);
GO
