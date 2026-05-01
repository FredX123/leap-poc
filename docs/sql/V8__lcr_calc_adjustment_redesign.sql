-- ============================================================
-- V8 - Redesign LCR_CALC_ADJUSTMENT table
-- Change from storing adjusted values to storing adjustment delta
-- ============================================================

-- Drop old columns
ALTER TABLE LCR_CALC_ADJUSTMENT DROP COLUMN n_adjusted_market_value;
ALTER TABLE LCR_CALC_ADJUSTMENT DROP COLUMN n_adjusted_weighted_amount;
ALTER TABLE LCR_CALC_ADJUSTMENT DROP COLUMN v_reason;
GO

-- Add new columns
ALTER TABLE LCR_CALC_ADJUSTMENT ADD n_adjustment_value DECIMAL(20,5) NOT NULL DEFAULT 0;
ALTER TABLE LCR_CALC_ADJUSTMENT ADD v_comment NVARCHAR(500) NOT NULL DEFAULT '';
GO
