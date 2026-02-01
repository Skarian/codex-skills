#!/usr/bin/env bash
set -euo pipefail

resolve_state_dir() {
  if [ -n "${FIRECRAWL_STATE_DIR:-}" ]; then
    printf 'FIRECRAWL_STATE_DIR is not supported. Use CODEX_HOME or ~/.codex.\n' >&2
    exit 1
  fi
  if [ -n "${CODEX_HOME:-}" ] && ! [[ "${CODEX_HOME}" =~ ^[[:space:]]*$ ]]; then
    printf '%s/url-to-markdown/.state' "$CODEX_HOME"
    return
  fi
  if [ -z "${HOME:-}" ] || [[ "${HOME}" =~ ^[[:space:]]*$ ]]; then
    printf 'HOME is not set and CODEX_HOME is unset; cannot determine state directory.\n' >&2
    exit 1
  fi
  printf '%s/.codex/url-to-markdown/.state' "$HOME"
}

state_dir="$(resolve_state_dir)"
compose_project="${FIRECRAWL_COMPOSE_PROJECT:-firecrawl-selfhosted}"
compose_file="${state_dir}/docker-compose.yaml"
env_file="${state_dir}/.env"
last_used_file="${state_dir}/last_used"
lock_dir="${state_dir}/lock"
lock_timeout=30
lock_stale=600
lock_acquired=0
model_name="${FIRECRAWL_MODEL_NAME:-disabled}"
use_db_auth="${FIRECRAWL_USE_DB_AUTHENTICATION:-false}"
disable_blocklist="${FIRECRAWL_DISABLE_BLOCKLIST:-true}"
up_quiet="${FIRECRAWL_UP_QUIET:-1}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

require_cmd docker
require_cmd firecrawl

if ! docker compose version >/dev/null 2>&1; then
  printf 'Missing required command: docker compose\n' >&2
  exit 1
fi

if ! [[ "$up_quiet" =~ ^[01]$ ]]; then
  printf 'FIRECRAWL_UP_QUIET must be 0 or 1.\n' >&2
  exit 1
fi

mkdir -p "$state_dir"

acquire_lock() {
  local start now
  start="$(date +%s)"
  while :; do
    if mkdir "$lock_dir" 2>/dev/null; then
      printf '%s\n' "$$" > "${lock_dir}/pid"
      date +%s > "${lock_dir}/created_at"
      lock_acquired=1
      return 0
    fi
    now="$(date +%s)"
    if [ -f "${lock_dir}/created_at" ]; then
      local created_at age
      created_at="$(cat "${lock_dir}/created_at" 2>/dev/null || true)"
      if [[ "$created_at" =~ ^[0-9]+$ ]]; then
        age=$((now - created_at))
        if [ "$age" -ge "$lock_stale" ]; then
          rm -rf "$lock_dir"
          continue
        fi
      else
        rm -rf "$lock_dir"
        continue
      fi
    else
      rm -rf "$lock_dir"
      continue
    fi
    if [ $((now - start)) -ge "$lock_timeout" ]; then
      printf 'Timed out waiting for the shared lock.\n' >&2
      return 1
    fi
    sleep 1
  done
}

release_lock() {
  if [ "$lock_acquired" -eq 1 ]; then
    rm -rf "$lock_dir"
    lock_acquired=0
  fi
}

trap 'release_lock' EXIT

if ! acquire_lock; then
  exit 1
fi

if [ ! -f "$env_file" ]; then
  cat > "$env_file" <<ENVEOF
MODEL_NAME=${model_name}
MODEL_EMBEDDING_NAME=
OPENAI_API_KEY=
OPENAI_BASE_URL=
OLLAMA_BASE_URL=
SLACK_WEBHOOK_URL=
BULL_AUTH_KEY=CHANGEME
TEST_API_KEY=
POSTHOG_API_KEY=
POSTHOG_HOST=
NUQ_RABBITMQ_URL=
RABBITMQ_DEFAULT_USER=firecrawl
RABBITMQ_DEFAULT_PASS=firecrawl
SUPABASE_ANON_TOKEN=
SUPABASE_URL=
SUPABASE_SERVICE_TOKEN=
SELF_HOSTED_WEBHOOK_URL=
SERPER_API_KEY=
SEARCHAPI_API_KEY=
LOGGING_LEVEL=INFO
PROXY_SERVER=
PROXY_USERNAME=
PROXY_PASSWORD=
SEARXNG_ENDPOINT=
SEARXNG_ENGINES=
SEARXNG_CATEGORIES=
USE_DB_AUTHENTICATION=${use_db_auth}
DISABLE_BLOCKLIST=${disable_blocklist}
ENV=local
HOST=0.0.0.0
PORT=3002
ENVEOF
fi

cat > "$compose_file" <<'YAMLEOF'
x-common-service: &common-service
  image: ghcr.io/firecrawl/firecrawl:latest
  ulimits:
    nofile:
      soft: 65535
      hard: 65535
  extra_hosts:
    - "host.docker.internal:host-gateway"

x-common-env: &common-env
  REDIS_URL: ${REDIS_URL:-redis://redis:6379}
  REDIS_RATE_LIMIT_URL: ${REDIS_RATE_LIMIT_URL:-redis://redis:6379}
  PLAYWRIGHT_MICROSERVICE_URL: ${PLAYWRIGHT_MICROSERVICE_URL:-http://playwright-service:3000/scrape}
  NUQ_DATABASE_URL: ${NUQ_DATABASE_URL:-postgres://postgres:postgres@nuq-postgres:5432/postgres}
  NUQ_RABBITMQ_URL: ${NUQ_RABBITMQ_URL:-amqp://firecrawl:firecrawl@rabbitmq:5672}
  USE_DB_AUTHENTICATION: ${USE_DB_AUTHENTICATION:-}
  OPENAI_API_KEY: ${OPENAI_API_KEY:-}
  OPENAI_BASE_URL: ${OPENAI_BASE_URL:-}
  MODEL_NAME: ${MODEL_NAME:-}
  MODEL_EMBEDDING_NAME: ${MODEL_EMBEDDING_NAME:-}
  OLLAMA_BASE_URL: ${OLLAMA_BASE_URL:-}
  SLACK_WEBHOOK_URL: ${SLACK_WEBHOOK_URL:-}
  BULL_AUTH_KEY: ${BULL_AUTH_KEY:-}
  TEST_API_KEY: ${TEST_API_KEY:-}
  POSTHOG_API_KEY: ${POSTHOG_API_KEY:-}
  POSTHOG_HOST: ${POSTHOG_HOST:-}
  SUPABASE_ANON_TOKEN: ${SUPABASE_ANON_TOKEN:-}
  SUPABASE_URL: ${SUPABASE_URL:-}
  SUPABASE_SERVICE_TOKEN: ${SUPABASE_SERVICE_TOKEN:-}
  SELF_HOSTED_WEBHOOK_URL: ${SELF_HOSTED_WEBHOOK_URL:-}
  SERPER_API_KEY: ${SERPER_API_KEY:-}
  SEARCHAPI_API_KEY: ${SEARCHAPI_API_KEY:-}
  LOGGING_LEVEL: ${LOGGING_LEVEL:-INFO}
  PROXY_SERVER: ${PROXY_SERVER:-}
  PROXY_USERNAME: ${PROXY_USERNAME:-}
  PROXY_PASSWORD: ${PROXY_PASSWORD:-}
  NO_PROXY: ${NO_PROXY:-localhost,127.0.0.1,redis,nuq-postgres,playwright-service,host.docker.internal}
  SEARXNG_ENDPOINT: ${SEARXNG_ENDPOINT:-}
  SEARXNG_ENGINES: ${SEARXNG_ENGINES:-}
  SEARXNG_CATEGORIES: ${SEARXNG_CATEGORIES:-}
  DISABLE_BLOCKLIST: ${DISABLE_BLOCKLIST:-}

services:
  playwright-service:
    image: ghcr.io/firecrawl/playwright-service:latest
    shm_size: "1g"
    restart: unless-stopped
    environment:
      PORT: 3000
      PROXY_SERVER: ${PROXY_SERVER:-}
      PROXY_USERNAME: ${PROXY_USERNAME:-}
      PROXY_PASSWORD: ${PROXY_PASSWORD:-}
      BLOCK_MEDIA: ${BLOCK_MEDIA:-}
      NO_PROXY: ${NO_PROXY:-localhost,127.0.0.1,redis,nuq-postgres,playwright-service,host.docker.internal}

  api:
    <<: *common-service
    restart: unless-stopped
    ports:
      - "3002:3002"
    environment:
      <<: *common-env
      HOST: "0.0.0.0"
      PORT: 3002
      WORKER_PORT: 3005
      ENV: local
    depends_on:
      redis:
        condition: service_started
      playwright-service:
        condition: service_started
      rabbitmq:
        condition: service_started
      nuq-postgres:
        condition: service_healthy
    command: node dist/src/index.js

  worker:
    <<: *common-service
    restart: unless-stopped
    environment:
      <<: *common-env
      HOST: "0.0.0.0"
      PORT: 3005
      ENV: local
    depends_on:
      redis:
        condition: service_started
      rabbitmq:
        condition: service_started
      nuq-postgres:
        condition: service_healthy
    command: node dist/src/services/queue-worker.js

  extract-worker:
    <<: *common-service
    restart: unless-stopped
    environment:
      <<: *common-env
      HOST: "0.0.0.0"
      PORT: 3004
      ENV: local
    depends_on:
      redis:
        condition: service_started
      rabbitmq:
        condition: service_started
      nuq-postgres:
        condition: service_healthy
    command: node dist/src/services/extract-worker.js

  redis:
    image: redis:alpine
    command: redis-server --bind 0.0.0.0

  rabbitmq:
    image: rabbitmq:3
    restart: unless-stopped
    environment:
      RABBITMQ_DEFAULT_USER: ${RABBITMQ_DEFAULT_USER:-firecrawl}
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_DEFAULT_PASS:-firecrawl}

  nuq-postgres:
    build:
      context: "https://github.com/firecrawl/firecrawl.git#main:apps/nuq-postgres"
      dockerfile: Dockerfile
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    volumes:
      - nuq_pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      start_period: 30s
      interval: 10s
      timeout: 5s
      retries: 10

volumes:
  nuq_pg_data:
YAMLEOF

if [ "$up_quiet" -eq 1 ]; then
  compose_output="$(mktemp "${TMPDIR:-/tmp}/url_to_markdown_compose.XXXXXX")"
  if ! COMPOSE_PROJECT_NAME="$compose_project" docker compose -f "$compose_file" --env-file "$env_file" up -d >"$compose_output" 2>&1; then
    cat "$compose_output" >&2
    rm -f "$compose_output"
    exit 1
  fi
  rm -f "$compose_output"
else
  COMPOSE_PROJECT_NAME="$compose_project" docker compose -f "$compose_file" --env-file "$env_file" up -d
fi

date +%s > "$last_used_file"
