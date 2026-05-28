-- Run in the Supabase SQL editor

-- Add email reminder preference to existing profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_reminders boolean DEFAULT false;

-- Push subscriptions (one row per user+device)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    text        NOT NULL,
  p256dh      text        NOT NULL,
  auth        text        NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push subscriptions"
  ON public.push_subscriptions
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow the service-role key used by the Edge Function to read all subscriptions
CREATE POLICY "Service role reads all push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.role() = 'service_role');
