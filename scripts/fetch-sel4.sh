#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT_DIR/sel4/manifest.lock"

DEST="${1:-$ROOT_DIR/.upstream/sel4}"

command -v git >/dev/null 2>&1 || {
  echo "ERROR: git is required" >&2
  exit 1
}

rm -rf "$DEST"
mkdir -p "$(dirname "$DEST")"

echo "Fetching official upstream seL4 release $SEL4_RELEASE..."
git clone --no-checkout --filter=blob:none "$SEL4_UPSTREAM_REPOSITORY" "$DEST"
git -C "$DEST" fetch --force origin "refs/tags/$SEL4_RELEASE:refs/tags/$SEL4_RELEASE"

RESOLVED_COMMIT="$(git -C "$DEST" rev-list -n 1 "$SEL4_RELEASE")"
if [[ "$RESOLVED_COMMIT" != "$SEL4_KERNEL_COMMIT" ]]; then
  echo "ERROR: seL4 tag $SEL4_RELEASE resolved to $RESOLVED_COMMIT" >&2
  echo "Expected: $SEL4_KERNEL_COMMIT" >&2
  exit 1
fi

git -C "$DEST" checkout --detach "$SEL4_KERNEL_COMMIT"

ACTUAL_COMMIT="$(git -C "$DEST" rev-parse HEAD)"
if [[ "$ACTUAL_COMMIT" != "$SEL4_KERNEL_COMMIT" ]]; then
  echo "ERROR: checked-out seL4 commit does not match lock file" >&2
  exit 1
fi

if [[ ! -f "$DEST/CMakeLists.txt" || ! -d "$DEST/src" || ! -d "$DEST/include" ]]; then
  echo "ERROR: expected upstream seL4 source layout was not found" >&2
  exit 1
fi

if [[ ! -f "$DEST/LICENSE.md" && ! -f "$DEST/LICENSE" ]]; then
  echo "ERROR: upstream seL4 licence file was not found" >&2
  exit 1
fi

echo "TRILLION_SEL4_UPSTREAM_SOURCE_VERIFIED"
echo "release=$SEL4_RELEASE"
echo "commit=$ACTUAL_COMMIT"
