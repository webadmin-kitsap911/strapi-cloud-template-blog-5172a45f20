#!/usr/bin/env bash
# Pulls a full copy (content + media + config) from Strapi Cloud into this
# project, then exports it to a dated archive in backups/.
#
# Usage:
#   STRAPI_CLOUD_URL=https://<project>.strapiapp.com \
#   STRAPI_TRANSFER_TOKEN=<token> \
#   ./scripts/backup-from-cloud.sh
#
# Create the token in the deployed admin panel: Settings -> Transfer Tokens.

set -euo pipefail

cd "$(dirname "$0")/.."

# Load STRAPI_CLOUD_URL / STRAPI_TRANSFER_TOKEN from .env if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

: "${STRAPI_CLOUD_URL:?Set STRAPI_CLOUD_URL, e.g. https://<project>.strapiapp.com}"
: "${STRAPI_TRANSFER_TOKEN:?Set STRAPI_TRANSFER_TOKEN (deployed admin -> Settings -> Transfer Tokens)}"

DATE="$(date +%F-%H%M)"
BACKUP_DIR="backups"
LOCAL_DB=".tmp/data.db"
STASHED_DB=""

mkdir -p "$BACKUP_DIR"

# Stash the local dev database so the transfer doesn't destroy it
if [ -f "$LOCAL_DB" ]; then
  STASHED_DB="${LOCAL_DB}.pre-backup"
  cp "$LOCAL_DB" "$STASHED_DB"
  echo "Stashed local database to $STASHED_DB"
fi

restore_local_db() {
  if [ -n "$STASHED_DB" ] && [ -f "$STASHED_DB" ]; then
    mv "$STASHED_DB" "$LOCAL_DB"
    echo "Restored local database"
  fi
}
trap restore_local_db EXIT

echo "Pulling data from $STRAPI_CLOUD_URL ..."
npm run strapi -- transfer \
  --from "${STRAPI_CLOUD_URL%/}/admin" \
  --from-token "$STRAPI_TRANSFER_TOKEN" \
  --force

echo "Exporting to archive ..."
npm run strapi -- export \
  --no-encrypt \
  --file "$BACKUP_DIR/cloud-backup-$DATE"

echo "Done: $BACKUP_DIR/cloud-backup-$DATE.tar.gz"
