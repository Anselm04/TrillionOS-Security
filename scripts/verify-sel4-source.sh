#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$ROOT_DIR/.upstream/sel4"

bash "$ROOT_DIR/scripts/fetch-sel4.sh" "$SOURCE_DIR"

# Confirm the exact pinned commit after checkout.
# shellcheck disable=SC1091
source "$ROOT_DIR/sel4/manifest.lock"
ACTUAL_COMMIT="$(git -C "$SOURCE_DIR" rev-parse HEAD)"

test "$ACTUAL_COMMIT" = "$SEL4_KERNEL_COMMIT"
test -f "$SOURCE_DIR/CMakeLists.txt"
test -d "$SOURCE_DIR/src"
test -d "$SOURCE_DIR/include"

echo "TRILLION_SEL4_SOURCE_LAYOUT_OK"
