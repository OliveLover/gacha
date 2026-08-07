-- ================================================================
-- Gacha - PostgreSQL Schema
-- ================================================================
-- ================================================================
-- Users
-- ================================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255)    UNIQUE NOT NULL,
    nickname        VARCHAR(100)    NOT NULL,
    password_hash   VARCHAR(60)     NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);