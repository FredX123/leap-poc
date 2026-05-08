/**
 * Generates INSERT DML statements for LCR_CALCULATED_DATA,
 * LCR_CALCULATED_DEPENDENCY, and LCR_REFERENCE_DATA from osfi-lcr.json.
 *
 * Usage: node generate-lcr-inserts.js > ../docs/sql/osfi-lcr-data.sql
 */
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'docs', 'sample', 'lcr', 'osfi-lcr.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const CALC_ID = 6059;
const lines = [];

lines.push('-- ============================================================');
lines.push('-- OSFI LCR Data — Generated INSERT DML');
lines.push('-- Source: docs/sample/lcr/osfi-lcr.json');
lines.push('-- ============================================================');
lines.push('');

// --- calculatedData ---
lines.push('-- ===================== LCR_CALCULATED_DATA =====================');
lines.push('SET IDENTITY_INSERT LCR_CALCULATED_DATA ON;');
lines.push('');

const calcData = data.calculatedData || [];
for (let i = 0; i < calcData.length; i++) {
  const d = calcData[i];
  const id = i + 1;
  const calcVal = d.calculatedValue != null ? d.calculatedValue : 'NULL';
  const formula = d.formula != null ? `N'${d.formula.replace(/'/g, "''")}'` : 'NULL';
  const weight = d.weight != null ? d.weight : 'NULL';
  const dispVal = d.displayValue != null ? d.displayValue : 'NULL';

  lines.push(`INSERT INTO LCR_CALCULATED_DATA (id, n_calc_id, v_record_id, n_calculated_value, v_type, v_formula, n_weight, n_display_value)`);
  lines.push(`VALUES (${id}, ${CALC_ID}, N'${d.recordId}', ${calcVal}, N'${d.type}', ${formula}, ${weight}, ${dispVal});`);
}

lines.push('');
lines.push('SET IDENTITY_INSERT LCR_CALCULATED_DATA OFF;');
lines.push('GO');
lines.push('');

// --- calculatedDependency ---
lines.push('-- ===================== LCR_CALCULATED_DEPENDENCY =====================');
lines.push('');

let depId = 1;
for (let i = 0; i < calcData.length; i++) {
  const d = calcData[i];
  const parentId = i + 1;
  const deps = d.dependencies || [];
  for (const dep of deps) {
    const val = dep.value != null ? dep.value : 'NULL';
    lines.push(`INSERT INTO LCR_CALCULATED_DEPENDENCY (calculated_data_id, v_record_id, n_value) VALUES (${parentId}, N'${dep.recordId}', ${val});`);
    depId++;
  }
}

lines.push('GO');
lines.push('');

// --- referenceData ---
lines.push('-- ===================== LCR_REFERENCE_DATA =====================');
lines.push('');

const refData = data.referenceData || [];
for (const r of refData) {
  const prodClass = r.product_class_result.replace(/'/g, "''");
  const repTypeAmt = r.reporting_type_amount.replace(/'/g, "''");
  const origAmt = r.original_amount != null ? r.original_amount : 'NULL';
  const repAmt = r.reporting_amount != null ? r.reporting_amount : 'NULL';
  const repCurrency = r.reportable_currency || 'NULL';
  const repCurrVal = repCurrency === 'NULL' ? 'NULL' : `N'${repCurrency}'`;
  const rowNo = r.rowNo != null ? r.rowNo : 'NULL';

  lines.push(`INSERT INTO LCR_REFERENCE_DATA (n_calc_id, n_reporting_row, v_product_class_result, v_reporting_type_amount, v_original_currency, n_original_amount, v_reporting_currency, n_reporting_amount, v_reportable_currency, n_row_no)`);
  lines.push(`VALUES (${r.calc_id}, ${r.reporting_row}, N'${prodClass}', N'${repTypeAmt}', N'${r.original_currency}', ${origAmt}, N'${r.reporting_currency}', ${repAmt}, ${repCurrVal}, ${rowNo});`);
}

lines.push('GO');
lines.push('');
lines.push('-- End of generated DML');

const outputPath = path.join(__dirname, '..', 'docs', 'sql', 'osfi-lcr-data.sql');
fs.writeFileSync(outputPath, lines.join('\n'), 'utf-8');
console.log(`Generated ${outputPath}`);
console.log(`  calculatedData: ${calcData.length} records`);
console.log(`  dependencies: ${depId - 1} records`);
console.log(`  referenceData: ${refData.length} records`);

