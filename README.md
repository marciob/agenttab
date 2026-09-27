# agenttab

agenttab sets the title of the terminal of an agent session. The title is
`<state icon> <text>`, for example `◑ Terminal title customization`.

## States

| Icon | State | Hook of Claude Code |
|---|---|---|
| (none) | The agent waits for your next prompt. | `SessionStart`, `Stop` |
| `◐` `◑` in turn | The agent works. | `UserPromptSubmit`, `PostToolUse` |
| `⚠` | The agent waits for your permission. | `Notification` (`permission_prompt`) |

## Settings

Write the file `~/.config/agenttab/config`. Each line is optional:

```sh
ICON_IDLE=""
ICON_BUSY="◐ ◑"         # several frames, separated by spaces, make an animation
ICON_WAIT="⚠"
SPIN_INTERVAL="0.5"     # seconds between two frames
TEXT="topic"   # topic: the title of the conversation. folder: the name of the directory.
```

An empty icon gives a title with no icon.

## Install

1. Put `bin/agenttab` on the PATH.
2. Add the five hooks above to `~/.claude/settings.json`, as `agenttab hook <idle|busy|wait>`.
3. Add `export CLAUDE_CODE_DISABLE_TERMINAL_TITLE=1` to `~/.zshrc`. Claude Code then does not write its own title.
4. In Cursor or VS Code, set `"terminal.integrated.tabs.title": "${sequence}"`.

## Cost

The hook is a shell script. It runs for about 60 ms at each change of state, and
then it stops. The hook prints nothing, so it adds no tokens to the conversation.

While the agent works, one shell loop shows the frames. It uses about 2 MB. It
stops when the agent stops working, when the agent process ends, or when the
terminal closes. A busy icon with one frame starts no loop.
