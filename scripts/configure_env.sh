#!/usr/bin/env bash
set -euo pipefail

# Configure deploy environment file for deploy.sh
# - Interactive prompts with sane defaults
# - Optional flags for non-interactive setup
#
# Usage (interactive):
#   bash scripts/configure_env.sh
#
# Usage (non-interactive):
#   bash scripts/configure_env.sh \
#     --image username/pos-bolt --tag latest \
#     --name pos-bolt --port 33000 --cport 80 \
#     --bind 0.0.0.0 --docker-user user --docker-pass pass \
#     --run-args "-e FOO=bar" --file /path/to/deploy.env

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE_DEFAULT="$SCRIPT_DIR/deploy.env"

IMAGE_NAME=""
IMAGE_TAG="latest"
CONTAINER_NAME="pos-bolt"
PORT="33000"
CONTAINER_PORT="80"  # 80 or 443
BIND_ADDR="0.0.0.0"
DOCKER_USER=""
DOCKER_PASS=""
RUN_ARGS=""
ENV_FILE="$ENV_FILE_DEFAULT"

usage() {
  sed -n '1,40p' "$0" | sed 's/^# //'
}

while [[ $# -gt 0 ]]; then
  case "$1" in
    --image) IMAGE_NAME="$2"; shift 2;;
    --tag) IMAGE_TAG="$2"; shift 2;;
    --name) CONTAINER_NAME="$2"; shift 2;;
    --port) PORT="$2"; shift 2;;
    --cport) CONTAINER_PORT="$2"; shift 2;;
    --bind) BIND_ADDR="$2"; shift 2;;
    --docker-user) DOCKER_USER="$2"; shift 2;;
    --docker-pass) DOCKER_PASS="$2"; shift 2;;
    --run-args) RUN_ARGS="$2"; shift 2;;
    --file) ENV_FILE="$2"; shift 2;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown option: $1" >&2; usage; exit 1;;
  esac
done

prompt() {
  local label="$1"; shift
  local default="$1"; shift
  local hide="${1:-}" # if 'hide', read -s
  if [[ -n "$hide" ]]; then
    read -r -s -p "$label [$default]: " input
    echo
  else
    read -r -p "$label [$default]: " input
  fi
  echo "${input:-$default}"
}

is_int() { [[ "$1" =~ ^[0-9]+$ ]]; }

validate() {
  if [[ -z "$IMAGE_NAME" ]]; then echo "IMAGE_NAME is required" >&2; exit 1; fi
  if ! is_int "$PORT"; then echo "PORT must be an integer" >&2; exit 1; fi
  if (( PORT < 33000 )); then echo "PORT must be >= 33000" >&2; exit 1; fi
  if ! is_int "$CONTAINER_PORT"; then echo "CONTAINER_PORT must be an integer" >&2; exit 1; fi
  if [[ "$CONTAINER_PORT" -ne 80 && "$CONTAINER_PORT" -ne 443 ]]; then
    echo "CONTAINER_PORT must be 80 or 443" >&2; exit 1
  fi
}

escape_squote() { printf "%s" "$1" | sed "s/'/'\\''/g"; }

write_env() {
  mkdir -p "$(dirname "$ENV_FILE")"
  {
    echo "IMAGE_NAME='$(escape_squote "$IMAGE_NAME")'"
    echo "IMAGE_TAG='$(escape_squote "$IMAGE_TAG")'"
    echo "CONTAINER_NAME='$(escape_squote "$CONTAINER_NAME")'"
    echo "PORT='$(escape_squote "$PORT")'"
    echo "CONTAINER_PORT='$(escape_squote "$CONTAINER_PORT")'"
    echo "BIND_ADDR='$(escape_squote "$BIND_ADDR")'"
    if [[ -n "$DOCKER_USER" ]]; then echo "DOCKER_USER='$(escape_squote "$DOCKER_USER")'"; fi
    if [[ -n "$DOCKER_PASS" ]]; then echo "DOCKER_PASS='$(escape_squote "$DOCKER_PASS")'"; fi
    if [[ -n "$RUN_ARGS" ]]; then echo "RUN_ARGS='$(escape_squote "$RUN_ARGS")'"; fi
  } > "$ENV_FILE"
  echo "Wrote env to $ENV_FILE"
}

# If IMAGE_NAME not provided, assume interactive mode
if [[ -z "$IMAGE_NAME" ]]; then
  echo "Configure deploy.env (press Enter to accept defaults)"
  IMAGE_NAME="$(prompt "IMAGE_NAME (Docker repo e.g. username/pos-bolt)" "$IMAGE_NAME")"
  IMAGE_TAG="$(prompt "IMAGE_TAG" "$IMAGE_TAG")"
  CONTAINER_NAME="$(prompt "CONTAINER_NAME" "$CONTAINER_NAME")"
  PORT="$(prompt "PORT (>= 33000)" "$PORT")"
  CONTAINER_PORT="$(prompt "CONTAINER_PORT (80 or 443)" "$CONTAINER_PORT")"
  BIND_ADDR="$(prompt "BIND_ADDR" "$BIND_ADDR")"
  DOCKER_USER="$(prompt "DOCKER_USER (optional)" "$DOCKER_USER")"
  DOCKER_PASS="$(prompt "DOCKER_PASS (optional)" "$DOCKER_PASS" hide)"
  RUN_ARGS="$(prompt "RUN_ARGS (optional)" "$RUN_ARGS")"
fi

validate
write_env

