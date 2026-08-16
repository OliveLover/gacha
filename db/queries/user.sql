-- name: CreateUser :one
INSERT INTO users (email, nickname, password_hash, avatar_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;

-- name: GetUserByUserID :one
SELECT * FROM users
WHERE id = $1;

-- name: UpdateUserAvatar :one
UPDATE users
   SET avatar_id   = $2,
       updated_at  = NOW()
 WHERE id = $1
RETURNING *;