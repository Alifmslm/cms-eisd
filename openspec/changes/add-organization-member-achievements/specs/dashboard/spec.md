# Spec Delta

## ADDED Requirements

### Requirement: Achievements KPI on dashboard
The system SHALL display a Total achievements KPI on the dashboard with Finalist and Champion breakdown details, backed by extended `GET /api/dashboard` stats.

#### Scenario: KPI display with data
- **WHEN** user views the dashboard and achievements exist
- **THEN** system shows total achievements count plus Finalist count (result `Finalist`) and Champion count (result `Champion` or `1st Place`)

#### Scenario: KPI empty state
- **WHEN** user views the dashboard with zero achievements
- **THEN** system shows total 0 with Finalist 0 and Champion 0 rather than an error

#### Scenario: Stats API includes achievements
- **WHEN** authenticated user calls `GET /api/dashboard`
- **THEN** response includes `totalAchievements`, `finalistAchievements`, `championAchievements`, and `achievementsByYear` (counts keyed by `YYYY-MM`) alongside existing event/article counts without changing existing fields
