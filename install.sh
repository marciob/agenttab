#!/bin/sh
# Install agenttab.
#
#   From a clone:    ./install.sh   (links the files, so that `git pull` updates them)
#   From the web:    curl -fsSL https://raw.githubusercontent.com/marciob/agenttab/main/install.sh | sh
#
# The script puts agenttab in ~/.local/bin and the zsh hook in ~/.config/agenttab.
# It does not change the settings of an agent. The README shows the hooks to add.

set -eu

REPO="https://raw.githubusercontent.com/marciob/agenttab/main"
BIN_DIR="$HOME/.local/bin"         # the OpenCode plugin and the Cursor extension look here
CONF_DIR="$HOME/.config/agenttab"

command -v jq >/dev/null 2>&1 || { echo "agenttab needs jq. Install it (brew install jq), then run this script again." >&2; exit 1; }
command -v lsof >/dev/null 2>&1 || echo "Note: lsof is not installed. agenttab needs it only for Codex."

mkdir -p "$BIN_DIR" "$CONF_DIR"

src=$(cd "$(dirname "$0")" 2>/dev/null && pwd || true)
if [ -n "$src" ] && [ -f "$src/bin/agenttab" ] && [ -f "$src/shell/agenttab.zsh" ]; then
  ln -sf "$src/bin/agenttab" "$BIN_DIR/agenttab"
  ln -sf "$src/shell/agenttab.zsh" "$CONF_DIR/agenttab.zsh"
  echo "Linked agenttab from $src"
else
  curl -fsSL "$REPO/bin/agenttab" -o "$BIN_DIR/agenttab"
  curl -fsSL "$REPO/shell/agenttab.zsh" -o "$CONF_DIR/agenttab.zsh"
  echo "Downloaded agenttab"
fi
chmod +x "$BIN_DIR/agenttab"

case ":$PATH:" in
  *":$BIN_DIR:"*) ;;
  *) echo "Add $BIN_DIR to the PATH: export PATH=\"\$HOME/.local/bin:\$PATH\"" ;;
esac

echo "Next: add the hooks of your agent. Read https://github.com/marciob/agenttab#claude-code"
