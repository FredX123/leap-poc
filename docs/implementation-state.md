# Conversation & Comment System — Implementation State

> Tracks the progress of each phase from the [Implementation Plan](implementation-plan-conversation-system.md).

| Phase | Description | Status | Completed |
|-------|-------------|--------|-----------|
| 0 | Database Setup | ✅ Done | 2025-01-XX |
| 1 | Spring Data JPA + Budget Migration | ✅ Done | 2025-01-XX |
| 2 | Comment Module & Entities | ✅ Done | 2025-01-XX |
| 3 | Comment API (DTOs, Service, Controller) | ⬜ Not Started | — |
| 4 | Frontend — Comment Service + Models | ⬜ Not Started | — |
| 5 | Frontend — Comment UI Components | ⬜ Not Started | — |
| 6 | Polish & Hardening | ⬜ Not Started | — |

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
- [x] Created `EntityType.java` JPA entity
- [x] Created `EventType.java` JPA entity
- [x] Created `Comment.java` JPA entity
- [x] Created `CommentRepository` (Spring Data JPA)
- [x] Maven compile verified

## Phase 3 — Comment API ⬜

_Not started_

## Phase 4 — Frontend Comment Service ⬜

_Not started_

## Phase 5 — Frontend Comment UI ⬜

_Not started_

## Phase 6 — Polish & Hardening ⬜

_Not started_
