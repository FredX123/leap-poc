export interface CommentDto {
  id: number;
  userId: string;
  displayName: string;
  email: string;
  content: string;
  parentId: number | null;
  reportType: string;
  lineKey: string;
  segmentName: string | null;
  driverCode: string;
  eventType: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isOwner: boolean;
}

export interface CommentThreadDto {
  id: number;
  userId: string;
  displayName: string;
  email: string;
  content: string;
  parentId: number | null;
  reportType: string;
  lineKey: string;
  segmentName: string | null;
  driverCode: string;
  eventType: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isOwner: boolean;
  hasReplies: boolean;
  replies: CommentThreadDto[];
}

export interface CreateCommentRequest {
  reportType: string;
  lineKey: string;
  segmentName: string | null;
  content: string;
  parentId: number | null;
  driverCode: string;
}

export interface CommentDriver {
  code: string;
  label: string;
}

export const COMMENT_DRIVERS: CommentDriver[] = [
  {code: 'NONE', label: '— No driver —'},
  {code: 'MAT', label: 'Maturity rollover'},
  {code: 'SSN', label: 'Seasonality'},
  {code: 'WIN', label: 'Client win / inflow'},
  {code: 'LOSS', label: 'Client loss / outflow'},
  {code: 'RATE', label: 'Rate repricing'},
  {code: 'CORP', label: 'Corporate action'},
  {code: 'FIX', label: 'Data correction'},
  {code: 'OP', label: 'Operational balance shift'},
  {code: 'REG', label: 'Regulatory change'},
  {code: 'OTH', label: 'Other (see notes)'},
];

/** Maps driver code to its full label. */
export const DRIVER_LABEL_MAP: Record<string, string> = Object.fromEntries(
  COMMENT_DRIVERS.map(c => [c.code, c.label])
);

/** Info about a child row passed to the comment panel for hierarchy view. */
export interface CommentChildRow {
  code: string;
  name: string;
  parentCode: string | null;
  level: number;
  variance: number | null;
}

/** Summary data computed per-lineKey from hierarchy threads. */
export interface LineCommentSummary {
  lineKey: string;
  rootCount: number;
  lastUpdate: string | null;
  latestAuthor: string | null;
  drivers: string[];
  threads: CommentThreadDto[];
  variance: number | null;
}

/** Driver card data for By Driver tab. */
export interface DriverGroupData {
  driverCode: string;
  driverLabel: string;
  rowCount: number;
  lines: { lineKey: string; name: string; breadcrumb: string; rootCount: number; threads: CommentThreadDto[] }[];
}
