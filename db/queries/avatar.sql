-- name: ListActiveAvatars :many
SELECT * FROM avatars
WHERE is_active = true
ORDER BY sort_order;

-- name: GetAvatarByID :one
SELECT * FROM avatars
WHERE id = $1;