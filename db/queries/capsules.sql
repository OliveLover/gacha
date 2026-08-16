-- name: CreateCapsule :one
INSERT INTO capsules (user_id, message)
VALUES ($1, $2)
RETURNING *;

-- name: DrawCapsule :one
UPDATE capsules
SET drawn_at = NOW()
WHERE id = (
    SELECT id FROM capsules
     WHERE drawn_at IS NULL
     ORDER BY RANDOM()
     LIMIT 1
     FOR UPDATE SKIP LOCKED
)
RETURNING *;