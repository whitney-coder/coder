ALTER TABLE ONLY workspace_builds ADD COLUMN deadline TIMESTAMPTZ NOT NULL DEFAULT TIMESTAMPTZ '0001-01-01 00:00:00+00:00';