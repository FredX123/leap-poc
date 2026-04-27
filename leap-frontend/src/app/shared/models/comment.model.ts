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
  categoryCode: string;
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
  categoryCode: string;
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
  categoryCode: string;
}

export interface CommentCategory {
  code: string;
  label: string;
}

export const COMMENT_CATEGORIES: CommentCategory[] = [
  { code: 'NONE', label: '— No driver —' },
  { code: 'MAT',  label: 'Maturity rollover' },
  { code: 'SSN',  label: 'Seasonality' },
  { code: 'WIN',  label: 'Client win / inflow' },
  { code: 'LOSS', label: 'Client loss / outflow' },
  { code: 'RATE', label: 'Rate repricing' },
  { code: 'CORP', label: 'Corporate action' },
  { code: 'FIX',  label: 'Data correction' },
  { code: 'OP',   label: 'Operational balance shift' },
  { code: 'REG',  label: 'Regulatory change' },
  { code: 'OTH',  label: 'Other (see notes)' },
];
