# agenttab

agenttab sets the title of the terminal of an agent session. It works with
Claude Code, Codex, and OpenCode. The title is
`<state icon> <text>`, for example `◑ Terminal title customization`.

## States

| Icon | State | Hook of Claude Code |
|---|---|---|
| (none) | The agent waits for your next prompt. | `SessionStart`, `Stop` |
| `◐` `◑` in turn | The agent works. | `UserPromptSubmit`, `PostToolUse` |
| `⚠` | The agent waits for your permission. | `Notification` (`permission_prompt`) |
| (the shell title) | The session ends. | `SessionEnd` |

## Codex

Codex 0.157 has hooks like Claude Code. Put them in `~/.codex/hooks.json`:

| Event | Command |
|---|---|
| `SessionStart`, `Stop`, `Interrupt` | `agenttab hook idle codex` |
| `UserPromptSubmit`, `PostToolUse` | `agenttab hook busy codex` |
| `PermissionRequest` | `agenttab hook wait codex` |
| `SessionEnd` | `agenttab hook end codex` |

The timeout of the `Interrupt` hook must be 3 seconds or less.

Codex runs a new hook only after you trust it. Start Codex, type `/hooks`, and
trust each agenttab hook.

To stop the title of Codex itself, add this to `~/.codex/config.toml`:

```toml
[tui]
terminal_title = []
```

The text of the title is the name of the thread, from
`~/.codex/session_index.jsonl`.

## OpenCode

OpenCode has no hooks. The plugin `opencode/agenttab.js` reads the events of
the session and runs `agenttab set <state> <text>`.

1. Link the plugin: `ln -s "$PWD/opencode/agenttab.js" ~/.config/opencode/plugins/`
2. Add `export OPENCODE_DISABLE_TERMINAL_TITLE=1` to `~/.zshrc`.

The plugin ignores the busy and idle states of a subagent session. A permission
request from a subagent shows the wait icon, because it waits for you too.

## Settings

Write the file `~/.config/agenttab/config`. Each line is optional:

```sh
ICON_IDLE=""
ICON_BUSY="◐ ◑"         # several frames, separated by spaces, make an animation
ICON_WAIT="⚠"
SPIN_INTERVAL="0.8"     # seconds between two frames
TEXT="topic"   # topic: the title of the conversation. folder: the name of the directory.
```

## Your own name for a session

Type `/rename <name>` in Claude Code. agenttab then shows that name, with the
icon of the state, in place of the title that Claude Code made. The name shows
at the next change of state.

## A name from Cursor

Right-click the tab of a terminal and select **Rename (agenttab)**. The command
is also in the command palette as **Terminal: Rename (agenttab)**. An empty
name gives the automatic title back.

Do not use the built-in **Rename** item. It makes the name of the tab static,
so the tab ignores the title that agenttab writes, and the icon does not show.

The extension is in `cursor/`. It writes the name to
`~/.cache/agenttab/<tty>.name` and runs `agenttab refresh`. The name comes
before `/rename` and before the automatic title. The zsh hook reads the same
file, so a terminal with no agent also shows the name.

To build and install it:

```sh
cd cursor
npx @vscode/vsce package --allow-missing-repository
cursor --install-extension agenttab-0.1.0.vsix
```

An empty icon gives a title with no icon.

## Install

1. Put `bin/agenttab` on the PATH.
2. Add the six hooks above to `~/.claude/settings.json`, as `agenttab hook <idle|busy|wait|end>`.
3. Add `export CLAUDE_CODE_DISABLE_TERMINAL_TITLE=1` to `~/.zshrc`. Claude Code then does not write its own title.
4. In Cursor or VS Code, set `"terminal.integrated.tabs.title": "${sequence}"`.

## Cost

The hook is a shell script. It runs for about 60 ms at each change of state, and
then it stops. The hook prints nothing, so it adds no tokens to the conversation.

While the agent works, one shell loop shows the frames. It uses about 2 MB. It
stops when the agent stops working, when the agent process ends, or when the
terminal closes. A busy icon with one frame starts no loop.
