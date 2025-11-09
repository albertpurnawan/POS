#!/usr/bin/env bash
set -euo pipefail

# Deploy using docker compose. Builds images (frontend) and brings up services.
# It reads variables from an env file. Precedence:
#   DEPLOY_ENV_FILE > PROJECT_ROOT/.env.compose > scripts/.env > scripts/deploy.env

log() { echo "[compose-deploy] $*"; }

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "docker-compose.yml not found at $COMPOSE_FILE" >&2
  exit 1
fi

# Pick env file
ENV_FILE="${DEPLOY_ENV_FILE:-}"
if [[ -z "${ENV_FILE}" ]]; then
  if [[ -f "$PROJECT_ROOT/.env.compose" ]]; then
    ENV_FILE="$PROJECT_ROOT/.env.compose"
  elif [[ -f "$SCRIPT_DIR/.env" ]]; then
    ENV_FILE="$SCRIPT_DIR/.env"
  elif [[ -f "$SCRIPT_DIR/deploy.env" ]]; then
    ENV_FILE="$SCRIPT_DIR/deploy.env"
  fi
fi

if [[ -n "${ENV_FILE:-}" && -f "$ENV_FILE" ]]; then
  log "Using env file: $ENV_FILE"
else
  log "No env file found; relying on defaults and shell env"
  ENV_FILE=""
fi

# Optional docker login if credentials provided in env file
if [[ -n "${ENV_FILE}" ]]; then
  set +u
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set -u
fi

if [[ -n "${DOCKER_USER:-}" && -n "${DOCKER_PASS:-}" ]]; then
  log "Docker login as $DOCKER_USER"
  echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
else
  log "Skipping docker login (DOCKER_USER/PASS not provided)"
fi

# Build and run via compose
if [[ "${BACKEND_ENABLED:-0}" == "1" ]]; then
  log "Bringing up frontend + backend (profile: backend)"
  if [[ -n "$ENV_FILE" ]]; then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile backend up -d --build
  else
    docker compose -f "$COMPOSE_FILE" --profile backend up -d --build
  fi
else
  log "Bringing up frontend only"
  if [[ -n "$ENV_FILE" ]]; then
    docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build frontend
  else
    docker compose -f "$COMPOSE_FILE" up -d --build frontend
  fi
fi

docker compose -f "$COMPOSE_FILE" ps
log "Compose deployment complete"

