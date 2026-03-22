-- ============================================================
-- LEAP POC — Seed Data
-- Run after V1__schema.sql
-- ============================================================

-- ===================== ENTITY_TYPE =====================
INSERT INTO ENTITY_TYPE (entity_type, description) VALUES
    ('BUDGET_REPORT', 'Budget report line items'),
    ('ADJUSTMENT',    'Financial adjustment records'),
    ('USER',          'User profile entities');
GO

-- ===================== EVENT_TYPE =====================
INSERT INTO EVENT_TYPE (event_type, description) VALUES
    ('COMMENT',       'User-authored comment'),
    ('REPLY',         'Reply to an existing comment'),
    ('ADJUSTMENT',    'System-generated adjustment event'),
    ('STATUS_CHANGE', 'Entity status change event');
GO

-- ===================== BUDGET_REPORT =====================
-- Migrated from InMemoryBudgetRepository seed data
INSERT INTO BUDGET_REPORT (item_description, monthly_expenses, monthly_budget) VALUES
    ('Office Supplies',    320.00,  500.00),
    ('Cloud Hosting',     4800.00, 5000.00),
    ('Marketing',         2200.00, 3000.00),
    ('Travel & Lodging',  1500.00, 1200.00),
    ('Software Licenses',  950.00, 1000.00),
    ('Training & Certs',   600.00,  800.00);
GO

-- ===================== SAMPLE COMMENTS =====================
-- (Optional — useful for UI development; uses placeholder Entra OIDs)
INSERT INTO COMMENT (user_id, display_name, email, content, parent_id, entity_type, entity_id, event_type) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Alice Admin', 'alice@contoso.com',
     'Why did Travel & Lodging exceed the budget this month?',
     NULL, 'BUDGET_REPORT', 4, 'COMMENT'),

    ('00000000-0000-0000-0000-000000000002', 'Bob Writer', 'bob@contoso.com',
     'The team had an unplanned conference trip. We''ll adjust next month.',
     1, 'BUDGET_REPORT', 4, 'REPLY'),

    ('00000000-0000-0000-0000-000000000001', 'Alice Admin', 'alice@contoso.com',
     'OK, please submit the receipt breakdown as well.',
     2, 'BUDGET_REPORT', 4, 'REPLY'),

    ('00000000-0000-0000-0000-000000000003', 'Charlie Reader', 'charlie@contoso.com',
     'Cloud Hosting is running at 96% usage — should we consider increasing the budget?',
     NULL, 'BUDGET_REPORT', 2, 'COMMENT'),

    -- System-generated adjustment event
    ('SYSTEM', 'System', NULL,
     NULL,
     NULL, 'BUDGET_REPORT', 4, 'ADJUSTMENT');
GO

-- Set metadata for the system adjustment event
UPDATE COMMENT
SET metadata = N'{"field":"monthly_budget","old_value":1000.00,"new_value":1200.00,"reason":"Q2 travel budget increase"}'
WHERE id = 5 AND event_type = 'ADJUSTMENT';
GO
