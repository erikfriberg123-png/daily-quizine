-- Run this in the Supabase SQL editor for the shared project

CREATE TABLE IF NOT EXISTS daily_scores (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  username    TEXT        NOT NULL,
  date        DATE        NOT NULL,
  score       INTEGER     NOT NULL DEFAULT 0,
  correct     INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- One submission per user per day
CREATE UNIQUE INDEX IF NOT EXISTS daily_scores_user_date
  ON daily_scores (user_id, date)
  WHERE user_id IS NOT NULL;

-- RLS
ALTER TABLE daily_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read daily_scores" ON daily_scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own score" ON daily_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own score" ON daily_scores
  FOR UPDATE USING (auth.uid() = user_id);
