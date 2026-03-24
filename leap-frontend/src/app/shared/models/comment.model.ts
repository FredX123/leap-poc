export interface CommentDto {
  id: number;
  userId: string;
  displayName: string;
  email: string;
  content: string;
  parentId: number | null;
  entityType: string;
  entityId: number;
  eventType: string;
  metadata: string | null;
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
  entityType: string;
  entityId: number;
  eventType: string;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isOwner: boolean;
  isDeleted: boolean;
  replies: CommentThreadDto[];
}

export interface CreateCommentRequest {
  entityType: string;
  entityId: number;
  content: string;
  parentId: number | null;
}
