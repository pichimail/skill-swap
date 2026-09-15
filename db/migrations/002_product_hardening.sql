CREATE TABLE IF NOT EXISTS schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

ALTER TABLE matches ADD COLUMN IF NOT EXISTS skill_id bigint REFERENCES skills(id) ON DELETE SET NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS requested_by text REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS accepted_at timestamptz;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS declined_at timestamptz;

ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS normalized_skill text;
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS provider text;

UPDATE roadmaps
SET normalized_skill = lower(regexp_replace(trim(skill), '\s+', ' ', 'g'))
WHERE normalized_skill IS NULL;

ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS livekit_room text;
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS duration_seconds integer NOT NULL DEFAULT 0;
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS ended_reason text;

CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  author_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (comment IS NULL OR char_length(comment) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, author_id)
);

CREATE TABLE IF NOT EXISTS moderation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES learning_sessions(id) ON DELETE CASCADE,
  actor_id text REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text REFERENCES users(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('bug','contact')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 2 AND 5000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_roadmaps_user_skill_unique
  ON roadmaps(user_id, normalized_skill)
  WHERE user_id IS NOT NULL AND normalized_skill IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_livekit_room_unique
  ON learning_sessions(livekit_room)
  WHERE livekit_room IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_matches_skill_status ON matches(skill_id, status);
CREATE INDEX IF NOT EXISTS idx_support_user_created ON support_requests(user_id, created_at DESC);

INSERT INTO schema_migrations(version) VALUES ('002_product_hardening') ON CONFLICT (version) DO NOTHING;
