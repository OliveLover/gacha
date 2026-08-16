-- ================================================================
-- Gacha - PostgreSQL Schema
-- ================================================================
-- ================================================================
-- Avatars
-- ================================================================
CREATE TABLE avatars (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100)    UNIQUE NOT NULL,
    key             VARCHAR(255)    UNIQUE NOT NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT true,
    sort_order      INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ================================================================
-- Users
-- ================================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255)    UNIQUE NOT NULL,
    nickname        VARCHAR(100)    NOT NULL,
    password_hash   VARCHAR(60)     NOT NULL,
    avatar_id       UUID            REFERENCES avatars(id),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ================================================================
-- Capsules
-- ================================================================
CREATE TABLE capsules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    message         TEXT NOT NULL,
    drawn_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_capsules_undrawn ON capsules (drawn_at) WHERE drawn_at IS NULL;