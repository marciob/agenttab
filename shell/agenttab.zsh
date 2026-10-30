# agenttab for zsh: the title of a terminal that runs no agent.
#
# At the prompt, the title is the name of the directory. While a command runs,
# the title is "<directory> — <command>". A name from the Cursor rename
# (~/.cache/agenttab/<tty>.name) comes first, while its shell has the tty.
#
# Install: add `source ~/.config/agenttab/agenttab.zsh` to ~/.zshrc.

# The file has two lines: the pid of the shell that owns the name, and the name.
# A name of a closed terminal on the same tty number is deleted.
_agenttab_name() {
  local f=${AGENTTAB_STATE:-$HOME/.cache/agenttab}/${TTY:t}.name owner name
  [[ -s $f ]] || return 0
  { read -r owner; read -r name } < $f
  if [[ -n $owner && ${$(ps -o tty= -p $owner 2>/dev/null)// /} == ${TTY:t} ]]; then
    print -rn -- $name
  else
    rm -f $f
  fi
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
