#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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
compose_file="${state_dir}/docker-compose.yaml"
env_file="${state_dir}/.env"
last_used_file="${state_dir}/last_used"
lock_dir="${state_dir}/lock"
lock_timeout=30
lock_stale=600
lock_acquired=0
api_url="${FIRECRAWL_API_URL:-http://localhost:3002}"
idle_seconds="${FIRECRAWL_IDLE_SECONDS:-300}"
startup_timeout="${FIRECRAWL_STARTUP_TIMEOUT:-60}"
retry_interval="${FIRECRAWL_RETRY_INTERVAL:-2}"
compose_project="${FIRECRAWL_COMPOSE_PROJECT:-firecrawl-selfhosted}"

usage() {
  cat <<'USAGE' >&2
Usage:
  url_to_markdown_scrape.sh <url> [--include-tags <tags>] [--exclude-tags <tags>] [--no-main] [-- <passthrough args>]
USAGE
}

if ! [[ "$idle_seconds" =~ ^[0-9]+$ ]]; then
  printf 'FIRECRAWL_IDLE_SECONDS must be an integer.\n' >&2
  exit 1
fi

if ! [[ "$startup_timeout" =~ ^[0-9]+$ ]]; then
  printf 'FIRECRAWL_STARTUP_TIMEOUT must be an integer.\n' >&2
  exit 1
fi

if ! [[ "$retry_interval" =~ ^[0-9]+$ ]]; then
  printf 'FIRECRAWL_RETRY_INTERVAL must be an integer.\n' >&2
  exit 1
fi

url=""
include_tags=""
exclude_tags=""
main_content="true"
passthrough=()

require_arg() {
  if [ "$#" -lt 2 ] || [ -z "${2:-}" ]; then
    printf 'Missing value for %s\n' "$1" >&2
    exit 1
  fi
}

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
      fi
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

while [ "$#" -gt 0 ]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --include-tags)
      require_arg "$@"
      include_tags="$2"
      shift 2
      ;;
    --exclude-tags)
      require_arg "$@"
      exclude_tags="$2"
      shift 2
      ;;
    --no-main)
      main_content="false"
      shift
      ;;
    --)
      shift
      passthrough+=("$@")
      break
      ;;
    *)
      if [ -z "$url" ]; then
        url="$1"
      else
        passthrough+=("$1")
      fi
      shift
      ;;
  esac
done

if [ -z "$url" ]; then
  usage
  exit 1
fi

case "$url" in
  http://*|https://*)
    ;;
  *)
    printf 'URL must start with http:// or https://\n' >&2
    exit 1
    ;;
esac

"$script_dir/url_to_markdown_up.sh" >&2

cli_args=(--api-url "$api_url" scrape "$url" --format markdown)

if [ "$main_content" = "true" ]; then
  cli_args+=(--only-main-content)
fi

if [ -n "$include_tags" ]; then
  cli_args+=(--include-tags "$include_tags")
fi

if [ -n "$exclude_tags" ]; then
  cli_args+=(--exclude-tags "$exclude_tags")
fi

if [ "${#passthrough[@]}" -gt 0 ]; then
  for arg in "${passthrough[@]}"; do
    case "$arg" in
      --output|-o|--output=*)
        printf 'Output files are disabled. Use stdout only.\n' >&2
        exit 1
        ;;
    esac
  done
  cli_args+=("${passthrough[@]}")
fi

retry_budget="$startup_timeout"
last_error=""
err_file="$(mktemp "${TMPDIR:-/tmp}/url_to_markdown_err.XXXXXX")"
trap 'rm -f "$err_file"' EXIT
while :; do
  : > "$err_file"
  set +e
  output="$(firecrawl "${cli_args[@]}" 2>"$err_file")"
  status=$?
  set -e
  if [ "$status" -eq 0 ]; then
    break
  fi
  last_error="$(cat "$err_file")"
  retry_budget=$((retry_budget - retry_interval))
  if [ "$retry_budget" -le 0 ]; then
    printf 'URL to markdown scrape failed after %s seconds.\n' "$startup_timeout" >&2
    if [ -n "$last_error" ]; then
      printf '%s\n' "$last_error" >&2
    fi
    exit 1
  fi
  sleep "$retry_interval"
done

idle_token="$(date +%s)-$$-$(printf '%04x' "$((RANDOM % 65536))")"
updated_last_used=0
if acquire_lock; then
  printf '%s\n' "$idle_token" > "$last_used_file"
  updated_last_used=1
  release_lock
else
  printf 'Warning: failed to acquire shared lock; idle shutdown timer not scheduled.\n' >&2
fi

if [ "$updated_last_used" -eq 1 ]; then
  (
    exec </dev/null >/dev/null 2>&1
    sleep "$idle_seconds"
    if ! acquire_lock; then
      exit 0
    fi
    if [ -f "$last_used_file" ]; then
      latest_mark="$(cat "$last_used_file")"
    else
      latest_mark=""
    fi
    if [ "$latest_mark" = "$idle_token" ]; then
      if [ -f "$compose_file" ]; then
        COMPOSE_PROJECT_NAME="$compose_project" docker compose -f "$compose_file" --env-file "$env_file" down || true
      fi
    fi
    release_lock
  ) &
fi

printf '%s\n' "$output"
