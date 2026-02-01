# Firecrawl Self-Hosted CLI (Advanced)

## Defaults

- State directory: `$CODEX_HOME/url-to-markdown/.state` (fallback `~/.codex/url-to-markdown/.state`)
- If `CODEX_HOME` is unset, `HOME` must be set or the scripts will exit.
- API URL: `http://localhost:3002`
- Idle shutdown: 5 minutes (`300` seconds)
- Startup retry window: 120 seconds, retry every 10 seconds
- Health check path: `/v0/health/readiness` (uses `curl` to probe readiness)
- Empty output retry: 3 attempts, waiting 10 seconds between tries
- Recommended tool timeout (cold start): 180 seconds
- RabbitMQ: `amqp://firecrawl:firecrawl@rabbitmq:5672` (default)
- Docker Compose project name: `firecrawl-selfhosted`
- Images: `ghcr.io/firecrawl/firecrawl:latest` and `ghcr.io/firecrawl/playwright-service:latest`
- Model name placeholder: `disabled`
- DB authentication: `false`
- Blocklist disabled: `true`

## Environment overrides

- `FIRECRAWL_API_URL` to change the local API URL.
- `FIRECRAWL_IDLE_SECONDS` to change the idle shutdown window.
- `FIRECRAWL_STARTUP_TIMEOUT` to change how long the scrape retries while the API starts.
- `FIRECRAWL_RETRY_INTERVAL` to change the retry interval in seconds.
- `FIRECRAWL_HEALTH_PATH` to change the health endpoint path (or provide a full URL).
- `FIRECRAWL_COMPOSE_PROJECT` to change the Docker Compose project name.
- `FIRECRAWL_MODEL_NAME` to override the default model name written into `.env`.
- `FIRECRAWL_USE_DB_AUTHENTICATION` to force DB authentication on or off.
- `FIRECRAWL_DISABLE_BLOCKLIST` to force blocklist usage off.
- `FIRECRAWL_UP_QUIET` to silence docker compose startup output (`1` for quiet, `0` for verbose).
- `NUQ_RABBITMQ_URL` to override the RabbitMQ connection string.
- `RABBITMQ_DEFAULT_USER` and `RABBITMQ_DEFAULT_PASS` to override RabbitMQ credentials.

## Self-test

Run:

    bash "${CODEX_HOME:-$HOME/.codex}/skills/url-to-markdown/scripts/url_to_markdown_selftest.sh"

This scrapes `https://example.com`, verifies the markdown contains `Example Domain`, prints markdown to stdout, and stops the stack immediately after validation.

## Cleanup

Remove `$CODEX_HOME/url-to-markdown/.state` (or `~/.codex/url-to-markdown/.state`) to delete local compose state and timestamps.
