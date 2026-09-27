// agenttab for Cursor and VS Code: a rename that keeps the title dynamic.
//
// The built-in rename makes the tab name static, so the tab ignores the title
// that a program sends, and the state icon disappears. This command writes the
// name to ~/.cache/agenttab/<tty>.name. agenttab then writes "<icon> <name>".

const vscode = require('vscode');
const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const STATE_DIR = process.env.AGENTTAB_STATE || path.join(os.homedir(), '.cache', 'agenttab');
const AGENTTAB = path.join(os.homedir(), '.local', 'bin', 'agenttab');

function run(cmd, args) {
  return new Promise((resolve, reject) =>
    execFile(cmd, args, (err, stdout) => (err ? reject(err) : resolve(stdout.trim()))));
}

// The tty of the shell of a terminal, for example "ttys102".
async function ttyOf(terminal) {
  const pid = await terminal.processId;
  if (!pid) return null;
  const tty = await run('ps', ['-o', 'tty=', '-p', String(pid)]);
  return tty && tty !== '??' ? tty : null;
}

async function rename(arg) {
  // From the tab menu the argument can be the terminal. Else use the active one.
  const terminal = arg && typeof arg.processId === 'object' ? arg : vscode.window.activeTerminal;
  if (!terminal) return;

  const tty = await ttyOf(terminal);
  if (!tty) {
    vscode.window.showWarningMessage('agenttab: cannot find the tty of this terminal.');
    return;
  }

  const file = path.join(STATE_DIR, `${tty}.name`);
  let current = '';
  try { current = fs.readFileSync(file, 'utf8'); } catch {}

  const name = await vscode.window.showInputBox({
    prompt: 'Name of this terminal. An empty name gives the automatic title back.',
    value: current,
  });
  if (name === undefined) return; // Escape

  fs.mkdirSync(STATE_DIR, { recursive: true });
  if (name.trim()) fs.writeFileSync(file, name.trim());
  else fs.rmSync(file, { force: true });

  try {
    await run(AGENTTAB, ['refresh', `/dev/${tty}`]);
  } catch (err) {
    vscode.window.showWarningMessage(`agenttab: ${AGENTTAB} refresh failed: ${err.message}`);
  }
}

function activate(context) {
  context.subscriptions.push(vscode.commands.registerCommand('agenttab.rename', rename));
}

module.exports = { activate, deactivate() {} };
