# agenttab for zsh: the title of a terminal that runs no agent.
#
# At the prompt, the title is the name of the directory. While a command runs,
# the title is "<directory> — <command>". A name from the Cursor rename
# (~/.cache/agenttab/<tty>.name) comes first.
#
# Install: add `source ~/.config/agenttab/agenttab.zsh` to ~/.zshrc.

_agenttab_name() {
  local f=${AGENTTAB_STATE:-$HOME/.cache/agenttab}/${TTY:t}.name
  [[ -s $f ]] && print -rn -- "$(<$f)"
}

_agenttab_precmd() {
  local n=$(_agenttab_name)
  printf '\e]0;%s\a' "${n:-${(%):-%1~}}"
}

_agenttab_preexec() {
  local n=$(_agenttab_name)
  printf '\e]0;%s\a' "${n:-${(%):-%1~} — ${1[(w)1]}}"
}

autoload -Uz add-zsh-hook
add-zsh-hook precmd _agenttab_precmd
add-zsh-hook preexec _agenttab_preexec
