// agenttab for OpenCode: set the terminal title from the events of a session.
//
// Install: link this file into ~/.config/opencode/plugins/, and set
// OPENCODE_DISABLE_TERMINAL_TITLE=1, so that OpenCode writes no title of its own.

import { spawn, spawnSync } from "node:child_process"
import os from "node:os"
import path from "node:path"

const AGENTTAB = process.env.AGENTTAB_BIN || path.join(os.homedir(), ".local", "bin", "agenttab")

export const AgentTab = async ({ directory }) => {
  const sessions = new Map() // id -> { title, parentID }
  const folder = path.basename(directory || process.cwd())
  let queue = Promise.resolve()

  // A title that OpenCode gives before the model names the session.
  const isDefault = (title) => !title || /^(New session|Child session) - /.test(title)

  const text = (id) => {
    const title = sessions.get(id)?.title
    return isDefault(title) ? folder : title
  }

  // One call at a time, so the states arrive in order.
  const set = (state, id) => {
    const args = ["set", state, text(id)]
    queue = queue.then(
      () =>
        new Promise((resolve) => {
          const child = spawn(AGENTTAB, args, { stdio: "ignore" })
          child.on("error", resolve)
          child.on("exit", resolve)
        }),
    )
    return queue
  }

  // A subagent session has a parent. Its states are not the states of the tab.
  const isChild = (id) => Boolean(sessions.get(id)?.parentID)

  process.once("exit", () => {
    spawnSync(AGENTTAB, ["set", "end"], { stdio: "ignore" })
  })

  return {
    event: async ({ event }) => {
      const p = event.properties || {}
      switch (event.type) {
        case "session.created":
        case "session.updated":
          if (p.info?.id) sessions.set(p.info.id, { title: p.info.title, parentID: p.info.parentID })
          return
        case "session.status":
          if (isChild(p.sessionID)) return
          return set(p.status?.type === "idle" ? "idle" : "busy", p.sessionID)
        case "session.idle":
          if (isChild(p.sessionID)) return
          return set("idle", p.sessionID)
        // A permission asked by a subagent waits for the user too.
        case "permission.asked":
        case "permission.updated":
          return set("wait", p.sessionID)
        case "permission.replied":
          return set("busy", p.sessionID)
      }
    },
  }
}
