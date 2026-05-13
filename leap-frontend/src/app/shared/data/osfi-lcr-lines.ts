import { OsfiLcrReportLine } from '../models/lcr-report.model';

import linesJson from './osfi-lcr-lines.json';

/**
 * Static LCR report line definitions.
 * These are maintained on the frontend because the real API does not return them.
 */
export const OSFI_LCR_LINES: OsfiLcrReportLine[] = linesJson as OsfiLcrReportLine[];

