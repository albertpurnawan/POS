#!/usr/bin/env bash
set -euo pipefail

# Simple Docker-based deploy script for a static SPA served via Nginx.
# Required env vars:
#   IMAGE_NAME       - e.g. username/pos
#   IMAGE_TAG        - e.g. 123 or latest
#   CONTAINER_NAME   - e.g. pos
#   PORT             - public port (host), e.g. 33000+
#   CONTAINER_PORT   - container port: 80 or 443
# Optional:
#   DOCKER_USER      - for docker login
#   DOCKER_PASS      - for docker login
#   RUN_ARGS         - extra args for `docker run` (e.g. "-e FOO=bar")
#   BIND_ADDR        - host bind address, default 0.0.0.0

log() { echo "[deploy] $*"; }

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required env var: $name" >&2
    exit 1
  fi
}

# Auto-load env file if present (same directory as this script)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/deploy.env" ]]; then
  log "Loading env from $SCRIPT_DIR/deploy.env"
  set +u
  # shellcheck disable=SC1091
  . "$SCRIPT_DIR/deploy.env"
  set -u
fi

require_var IMAGE_NAME
require_var IMAGE_TAG
require_var CONTAINER_NAME
require_var PORT
require_var CONTAINER_PORT

# Validate PORT is integer and >= 33000, container port is fixed to 80
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
  echo "PORT must be an integer" >&2
  exit 1
fi
if (( PORT < 33000 )); then
  echo "PORT must be >= 33000 (container port is 80)" >&2
  exit 1
fi

if ! [[ "$CONTAINER_PORT" =~ ^[0-9]+$ ]]; then
  echo "CONTAINER_PORT must be an integer" >&2
  exit 1
fi
if [[ "$CONTAINER_PORT" -ne 80 && "$CONTAINER_PORT" -ne 443 ]]; then
  echo "CONTAINER_PORT must be 80 or 443" >&2
  exit 1
fi

# Default bind address
BIND_ADDR=${BIND_ADDR:-0.0.0.0}

if [[ -n "${DOCKER_USER:-}" && -n "${DOCKER_PASS:-}" ]]; then
  log "Docker login as $DOCKER_USER"
  echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
else
  log "Skipping docker login (DOCKER_USER/PASS not provided)"
fi

log "Pulling image ${IMAGE_NAME}:${IMAGE_TAG}"
docker pull "${IMAGE_NAME}:${IMAGE_TAG}"

if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  log "Removing existing container ${CONTAINER_NAME}"
  docker rm -f "${CONTAINER_NAME}" || true
fi

log "Starting container ${CONTAINER_NAME} on ${BIND_ADDR}:${PORT} -> ${CONTAINER_PORT}"
docker run -d \
  --restart unless-stopped \
  --name "${CONTAINER_NAME}" \
  -p "${BIND_ADDR}:${PORT}:${CONTAINER_PORT}" \
  ${RUN_ARGS:-} \
  "${IMAGE_NAME}:${IMAGE_TAG}"

log "Deployment complete"
