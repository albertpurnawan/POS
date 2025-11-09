#!/usr/bin/env bash
set -euo pipefail

# Simple Docker-based deploy script for a static SPA served via Nginx.
# Required env vars:
#   IMAGE_NAME       - e.g. username/pos-bolt
#   IMAGE_TAG        - e.g. 123 or latest
#   CONTAINER_NAME   - e.g. pos-bolt
#   PORT             - public port to map to container's 80, e.g. 8080
# Optional:
#   DOCKER_USER      - for docker login
#   DOCKER_PASS      - for docker login
#   RUN_ARGS         - extra args for `docker run` (e.g. "-e FOO=bar")

log() { echo "[deploy] $*"; }

require_var() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required env var: $name" >&2
    exit 1
  fi
}

require_var IMAGE_NAME
require_var IMAGE_TAG
require_var CONTAINER_NAME
require_var PORT

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

log "Starting container ${CONTAINER_NAME} on port ${PORT}"
docker run -d \
  --restart unless-stopped \
  --name "${CONTAINER_NAME}" \
  -p "${PORT}:80" \
  ${RUN_ARGS:-} \
  "${IMAGE_NAME}:${IMAGE_TAG}"

log "Deployment complete"

