#!/usr/bin/env bash
# Restores a backup archive (created by backup-from-cloud.sh) into the
# LOCAL project database. This REPLACES all local content and assets.
#
# Usage:
#   ./scripts/restore-backup.sh [path/to/backup.tar.gz]
#
# With no argument, restores the most recent archive in backups/.

set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="backups"

if [ $# -ge 1 ]; then
  ARCHIVE="$1"
else
  ARCHIVE="$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -n 1 || true)"
  if [ -z "$ARCHIVE" ]; then
    echo "No archives found in $BACKUP_DIR/ and no path given" >&2
    exit 1
  fi
fi

if [ ! -f "$ARCHIVE" ]; then
  echo "Archive not found: $ARCHIVE" >&2
  exit 1
fi

echo "This will REPLACE all local content and assets with: $ARCHIVE"
read -r -p "Continue? [y/N] " REPLY
case "$REPLY" in
  [yY]|[yY][eE][sS]) ;;
  *) echo "Aborted"; exit 1 ;;
esac

npm run strapi -- import --force --file "$ARCHIVE"

echo "Restore complete from $ARCHIVE"
