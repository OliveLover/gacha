-- name: CreateUser :one
INSERT INTO users (email, nickname, password_hash, avatar_id)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;