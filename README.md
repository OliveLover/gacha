# Gacha
![기간](https://img.shields.io/badge/개발기간-[Phase_1]_2026.08.07~2026.08.16(약10일)-blue)
![인원](https://img.shields.io/badge/개발인원-1인-green)
<img width="1800" height="1180" alt="gacha_readme_banner" src="https://github.com/user-attachments/assets/eb8812cf-307e-4c67-9b0d-29ac781d1e70" />

메시지를 캡슐에 담아 뽑기 머신에 넣고, 다른 사람이 랜덤으로 뽑아 읽는 캡슐 토이(가챠) 웹 서비스.

## Tech Stack

- Go + [Gin](https://github.com/gin-gonic/gin)
- PostgreSQL + [pgx/v5](https://github.com/jackc/pgx) + [sqlc](https://sqlc.dev/)
- JWT 기반 인증 ([golang-jwt](https://github.com/golang-jwt/jwt))
- Swagger ([swaggo](https://github.com/swaggo/swag))
- Vanilla JS + Bootstrap 5 (프론트엔드)

## Features

- **회원가입 / 로그인**: 이메일·비밀번호 기반 가입, 로그인 시 JWT 발급
- **아바타**: 프로필 아바타 목록 조회, 선택/변경
- **캡슐(가챠)**
  - 캡슐에 메시지 작성 → 뽑기 머신에 추가
  - 머신 손잡이를 돌려 랜덤으로 캡슐 하나를 뽑음 (1회성 소모, 동시 요청에도 중복 없이 뽑히도록 `FOR UPDATE SKIP LOCKED` 사용)
  - 뽑은 메시지와 작성자 닉네임을 모달로 확인

## Project Structure

```
main.go                  # 진입점, 의존성 조립, 라우트 등록
internal/
  handler/                # HTTP 핸들러 (요청/응답 DTO 변환)
  service/                # 도메인 로직
  dto/                    # 요청/응답 DTO
  middleware/             # 인증 미들웨어 등
  auth/                   # JWT 발급/검증
  route/                  # 라우트 등록
db/
  schema.sql              # DB 스키마
  queries/                # sqlc용 SQL 쿼리
  sqlc/                   # sqlc가 생성한 코드 (직접 수정 금지)
templates/                # 서버 렌더링 HTML (index, login, signup)
static/                   # JS/CSS/이미지 에셋
docs/                     # swag이 생성한 Swagger 문서
```

## API

Swagger 문서: 서버 실행 후 `http://localhost:8080/swagger/index.html`

| Method | Path                  | 설명                    | 인증 |
| ------ | --------------------- | ----------------------- | ---- |
| POST   | `/api/v1/signup`      | 회원가입                | -    |
| POST   | `/api/v1/login`       | 로그인 (JWT 발급)       | -    |
| GET    | `/api/v1/avatars`     | 아바타 목록 조회        | -    |
| GET    | `/api/v1/avatars/:id` | 아바타 단건 조회        | -    |
| PUT    | `/api/v1/users/avatar`| 내 아바타 변경          | O    |
| POST   | `/api/v1/capsules`    | 캡슐 메시지 작성        | O    |
| GET    | `/api/v1/capsules/count` | 남은(안 뽑힌) 캡슐 개수 | -    |
| POST   | `/api/v1/capsules/draw`  | 캡슐 랜덤 뽑기        | O    |

인증이 필요한 요청은 `Authorization: Bearer <token>` 헤더로 로그인 시 받은 JWT를 전달.

## 동작

<img width="996" height="746" alt="Project-Gacha" src="https://github.com/user-attachments/assets/34e47b36-c7ca-4590-b41f-dfa7b3a82a92" />


## Getting Started

### 1. 환경변수

프로젝트 루트에 `.env.dev` 파일을 만들고 아래 값을 채운다.

```
DB_URL=postgres://<user>:<password>@<host>/<db>
JWT_SECRET=<임의의 시크릿 문자열>
```

### 2. DB 스키마 적용

`db/schema.sql`을 PostgreSQL(Neon 등)에 실행한다.

### 3. 실행

```bash
go run main.go
```

`http://localhost:8080` 에서 확인 가능.

### sqlc 쿼리 재생성

`db/queries/*.sql`을 수정한 뒤:

```bash
sqlc generate
```

### Swagger 문서 재생성

핸들러의 swag 주석을 수정한 뒤:

```bash
swag init --parseDependency
```
