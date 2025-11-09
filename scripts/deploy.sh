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
# Build behavior (when no registry publish):
#   FORCE_BUILD=1    - always build locally (skip docker pull)
#   FALLBACK_BUILD=1 - build locally if docker pull fails
#   BUILD_CONTEXT    - path to Dockerfile (default: project root above scripts)

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
# Load env from precedence: DEPLOY_ENV_FILE > .env > deploy.env (in script dir)
ENV_FILE_CANDIDATE="${DEPLOY_ENV_FILE:-}"
if [[ -z "$ENV_FILE_CANDIDATE" ]]; then
  if [[ -f "$SCRIPT_DIR/.env" ]]; then
    ENV_FILE_CANDIDATE="$SCRIPT_DIR/.env"
  elif [[ -f "$SCRIPT_DIR/deploy.env" ]]; then
    ENV_FILE_CANDIDATE="$SCRIPT_DIR/deploy.env"
  fi
fi
if [[ -n "${ENV_FILE_CANDIDATE:-}" && -f "$ENV_FILE_CANDIDATE" ]]; then
  log "Loading env from $ENV_FILE_CANDIDATE"
  set +u
  # shellcheck disable=SC1091
  . "$ENV_FILE_CANDIDATE"
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

# Default build context: project root above scripts directory
BUILD_CONTEXT="${BUILD_CONTEXT:-$(dirname "$SCRIPT_DIR")}" 

if [[ "${FORCE_BUILD:-0}" == "1" ]]; then
  log "FORCE_BUILD=1 set. Building locally from $BUILD_CONTEXT"
  docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" "$BUILD_CONTEXT"
else
  log "Pulling image ${IMAGE_NAME}:${IMAGE_TAG}"
  set +e
  docker pull "${IMAGE_NAME}:${IMAGE_TAG}"
  PULL_RC=$?
  set -e

  if [[ "$PULL_RC" -ne 0 ]]; then
    if [[ "${FALLBACK_BUILD:-0}" == "1" ]]; then
      log "Pull failed. Building locally from $BUILD_CONTEXT"
      docker build -t "${IMAGE_NAME}:${IMAGE_TAG}" "$BUILD_CONTEXT"
    else
      echo "Failed to pull ${IMAGE_NAME}:${IMAGE_TAG}. Set FORCE_BUILD=1 or FALLBACK_BUILD=1 to build locally, or ensure the image exists and credentials are correct." >&2
      exit "$PULL_RC"
    fi
  fi
fi

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
