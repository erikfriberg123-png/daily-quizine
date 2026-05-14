-- Run this in the Supabase SQL editor
-- Adds server-side validation so scores can't be manipulated even via direct API calls

-- 1. Enforce that score matches the expected formula (3 questions, 150 pts each, +50 bonus if all correct)
ALTER TABLE daily_scores
  ADD CONSTRAINT valid_score_formula
  CHECK (
    correct BETWEEN 0 AND 3
    AND score = correct * 150 + CASE WHEN correct = 3 THEN 50 ELSE 0 END
  );

-- 2. Enforce reasonable bounds on username length
ALTER TABLE daily_scores
  ADD CONSTRAINT valid_username_length
  CHECK (char_length(username) BETWEEN 1 AND 30);

-- 3. Prevent future dates (can't submit a score for tomorrow)
ALTER TABLE daily_scores
  ADD CONSTRAINT no_future_date
  CHECK (date <= CURRENT_DATE + INTERVAL '1 hour');
