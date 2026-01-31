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
lock_dir="${state_dir}/lock"
lock_timeout=30
lock_stale=600
lock_acquired=0
compose_project="${FIRECRAWL_COMPOSE_PROJECT:-firecrawl-selfhosted}"

url="https://example.com"

output="$(FIRECRAWL_UP_QUIET=0 "$script_dir/url_to_markdown_scrape.sh" "$url")"

if [ -z "$output" ]; then
  printf 'Expected stdout output but received none.\n' >&2
  exit 1
fi

if ! printf '%s\n' "$output" | grep -q "Example Domain"; then
  printf 'Expected output to contain "Example Domain".\n' >&2
  exit 1
fi

printf '%s\n' "$output"

if [ -f "$compose_file" ]; then
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

  if ! acquire_lock; then
    exit 1
  fi
  COMPOSE_PROJECT_NAME="$compose_project" docker compose -f "$compose_file" --env-file "$env_file" down >/dev/null || true
  release_lock
fi

printf 'Self-test passed. Containers stopped.\n' >&2
