-- Add segment column to daily_scores so each segment has its own isolated
-- leaderboard and Hall of Fame. Existing rows are tagged as 'quizine'.

ALTER TABLE daily_scores
  ADD COLUMN IF NOT EXISTS segment TEXT NOT NULL DEFAULT 'quizine';

-- Drop the old per-user-per-day unique index and replace it with one that
-- also includes segment, so the same user can have one score per segment per day.
DROP INDEX IF EXISTS daily_scores_user_date;

CREATE UNIQUE INDEX IF NOT EXISTS daily_scores_user_date_segment
  ON daily_scores (user_id, date, segment)
  WHERE user_id IS NOT NULL;
