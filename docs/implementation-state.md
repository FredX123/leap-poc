# Conversation & Comment System — Implementation State

> Tracks the progress of each phase from the [Implementation Plan](implementation-plan-conversation-system.md).

| Phase | Description | Status | Completed |
|-------|-------------|--------|-----------|
| 0 | Database Setup | ✅ Done | 2025-01-XX |
| 1 | Spring Data JPA + Budget Migration | ✅ Done | 2025-01-XX |
| 2 | Comment Module & Entities | ✅ Done | 2025-01-XX |
| 3 | Comment API (DTOs, Service, Controller) | ✅ Done | 2025-01-XX |
| 4 | Frontend — Comment Service + Models | ✅ Done | 2026-03-23 |
| 5 | Frontend — Comment UI Components | ✅ Done | 2026-03-23 |
| 6 | Polish & Hardening | ✅ Done | 2025-06-20 |

---

## Phase 0 — Database Setup ✅

- [x] Created `LeapPoc` database on local MS SQL Server Developer Edition
- [x] Ran `V1__schema.sql` — tables ENTITY_TYPE, EVENT_TYPE, BUDGET_REPORT, COMMENT created
- [x] Ran `V2__seed_data.sql` — lookup data, 6 budget rows, 5 sample comments inserted
- [x] Verified all tables and data

## Phase 1 — Spring Data JPA + Budget Migration ✅

- [x] Added `spring-boot-starter-data-jpa` and `mssql-jdbc` dependencies
- [x] Configured MSSQL datasource in `application.yml`
- [x] Created `BudgetReport.java` JPA entity (replaces `BudgetRow.java`)
- [x] Migrated `BudgetRepository` to extend `JpaRepository`
- [x] Deleted `InMemoryBudgetRepository.java`
- [x] Updated `BudgetServiceImpl` for JPA repository
- [x] Maven compile verified

## Phase 2 — Comment Module & Entities ✅

- [x] Created `leap-comment/pom.xml`
- [x] Registered `leap-comment` in parent POM
- [x] Added `leap-comment` dependency to `leap-app/pom.xml`
- [x] ~~Created `EntityType.java` / `EventType.java` JPA entities~~ → Replaced with enums in Phase 3
- [x] Created `Comment.java` JPA entity (refactored: plain String columns for entity_type/event_type)
- [x] Created `CommentRepository` (Spring Data JPA)
- [x] Maven compile verified

## Phase 3 — Comment API ✅

**Architecture decisions:**
- Replaced `EntityType` / `EventType` JPA entities with Java enums (`CommentEntityType`, `CommentEventType`) in leap-shared — DB FK constraints still enforce integrity
- Refactored `Comment` entity to use plain `String` columns for `entity_type` / `event_type` (no `@ManyToOne`)
- Added MapStruct 1.6.3 for entity→DTO mapping
- Added `@RestControllerAdvice` global exception handler with `BusinessException` hierarchy

**New files (leap-shared):**
- [x] `CommentEntityType.java` — enum: BUDGET_REPORT, ADJUSTMENT, USER
- [x] `CommentEventType.java` — enum: COMMENT, REPLY, ADJUSTMENT, STATUS_CHANGE
- [x] `BusinessException.java` — abstract base with HTTP status code
- [x] `ResourceNotFoundException.java` → 404
- [x] `CommentDepthExceededException.java` → 400
- [x] `CrossEntityReplyException.java` → 400
- [x] `UnauthorizedOperationException.java` → 403
- [x] `ApiErrorResponse.java` — standard error response body
- [x] `CreateCommentRequest.java` — with Jakarta Validation annotations
- [x] `UpdateCommentRequest.java` — content only
- [x] `CommentDto.java` — flat comment representation
- [x] `CommentThreadDto.java` — nested with `replies` list

**New files (leap-comment):**
- [x] `CommentMapper.java` — MapStruct mapper (entity → DTO / ThreadDTO)
- [x] `CommentService.java` — service interface
- [x] `CommentServiceImpl.java` — thread building, depth validation, cross-entity check, ownership enforcement
- [x] `CommentController.java` — REST endpoints: GET/POST/PUT/DELETE `/api/comments`

**New files (leap-app):**
- [x] `GlobalExceptionHandler.java` — `@RestControllerAdvice` handling BusinessException, validation, 404, 500

**Modified files:**
- [x] `Comment.java` — simplified: plain String columns, Long parentId
- [x] `CommentRepository.java` — updated query method name
- [x] `BudgetController.java` — removed inline try-catch (uses global handler)
- [x] POMs: MapStruct + validation dependencies
- [x] Maven compile verified

## Phase 4 — Frontend Comment Service + Models ✅

- [x] Created `shared/models/comment.model.ts` — `CommentDto`, `CommentThreadDto`, `CreateCommentRequest` interfaces
- [x] Created `core/services/comment.service.ts` — `getThread()`, `create()`, `update()`, `delete()`
- [x] `ng build` verified

## Phase 5 — Frontend Comment UI Components ✅

**New components:**
- [x] `CommentInputComponent` — textarea + send button, emits `submitted` event
- [x] `CommentEntryComponent` — recursive rendering with reply/edit/delete, system event styling, avatar initials, "Edited" badge
- [x] `CommentThreadPanelComponent` — slide-out side panel with backdrop, loading/empty/error states, loads thread on open

**Integration:**
- [x] `BudgetReportComponent` — added Comments column with chat icon + count badge per row
- [x] `<app-comment-thread-panel>` integrated with entityType=BUDGET_REPORT + entityId=row.id
- [x] Comment count updates when panel loads via `commentCountChanged` event

**Visual features:**
- [x] Slide-out animation (right: -420px → 0) with backdrop overlay
- [x] Threaded indentation with left border styling
- [x] System events (ADJUSTMENT/STATUS_CHANGE) with amber background + gear icon
- [x] Avatar initials circle for user comments
- [x] `ng build` verified

## Phase 6 — Polish & Hardening ✅

### 6.1 — Error Handling
- [x] `CommentThreadPanelComponent` now categorises errors by HTTP status (401 session expired, 403 permission denied, 404 not found, 500 server error, 0 network error)
- [x] Network/server errors show a **Retry** button
- [x] All error handlers pass `HttpErrorResponse` to `resolveError()` for consistent messaging

### 6.2 — Empty State
- [x] Already present from Phase 5: "No comments yet. Start the conversation!" with chat icon

### 6.3 — Loading State
- [x] Already present from Phase 5: spinner-border while thread loads

### 6.4 — Deleted Comment Display
- [x] Backend `getThread()` now fetches ALL comments (including soft-deleted) and retains deleted parents that have non-deleted descendants
- [x] `CommentThreadDto` gains `isDeleted` field; deleted entries have content/displayName/email nulled out
- [x] `CommentEntryComponent` renders deleted comments as `[This comment has been removed]` with dashed border + muted icon
- [x] Replies under a deleted parent still display normally
- [x] `CommentRepository` added `findByEntityTypeAndEntityIdOrderByCreatedAtAsc`

### 6.5 — Collapse Deep Threads
- [x] Replies beyond depth 3 auto-collapse with "Show N more replies" link
- [x] `CommentEntryComponent` uses `expanded` flag and `ng-template #collapsedReplies`

### 6.6 — Comment Count Badge (Batch)
- [x] `CommentRepository` added `countByEntityTypeAndEntityIds` JPQL query (GROUP BY)
- [x] `CommentService.getCounts()` returns `Map<Long, Long>` for batch entity IDs
- [x] `CommentController.getCounts()` — `GET /api/comments/counts?entityType=&entityIds=`
- [x] `CommentService` (Angular) added `getCounts()` method
- [x] `BudgetReportComponent.loadCommentCounts()` — fetches counts after rows load; badges display immediately on page load

### 6.7 — Optimistic UI
- [x] `onNewComment()` appends a temporary entry (negative temp ID) to thread before server confirms
- [x] On success: full reload from server replaces the optimistic entry
- [x] On error: optimistic entry is removed and error message shown

### 6.8 — Accessibility
- [x] Comment panel: `role="complementary"`, `aria-label`, `aria-live="polite"`, Escape key closes
- [x] Thread list: `role="log"`, `aria-labelledby`
- [x] Comment entries: `role="article"`, `aria-label` with author name
- [x] Action buttons: `aria-label`, `aria-expanded` (reply toggle)
- [x] Icons: `aria-hidden="true"` on decorative icons
- [x] Comment input: `aria-label` on textarea and send button
- [x] Budget table comment button: dynamic `aria-label` with row item and count
- [x] `trackBy` added to all `*ngFor` loops for performance

**Modified files (backend):**
- `CommentThreadDto.java` — added `isDeleted` field
- `CommentRepository.java` — added 3 new query methods (all comments, single count, batch counts)
- `CommentService.java` — added `getCounts()` interface method
- `CommentServiceImpl.java` — rewritten `getThread()` for deleted placeholders; added `getCounts()`
- `CommentController.java` — added `GET /api/comments/counts` endpoint

**Modified files (frontend):**
- `comment.model.ts` — added `isDeleted` to `CommentThreadDto`
- `comment.service.ts` — added `getCounts()` method
- `comment-entry.component.ts` — deleted display, deep thread collapse, ARIA, trackBy
- `comment-input.component.ts` — ARIA labels
- `comment-thread-panel.component.ts` — categorised errors, retry, optimistic UI, ARIA, Escape key
- `budget-report.component.ts` — batch comment count loading, CommentService injection
- `budget-report.component.html` — accessible comment button with dynamic aria-label

**Build verification:**
- [x] `mvn compile` — ✅ success
- [x] `ng build` — ✅ success (no new warnings)
