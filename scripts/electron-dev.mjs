import { spawn } from "node:child_process"
import { watch } from "node:fs"
import path from "node:path"
import { setTimeout as delay } from "node:timers/promises"

const devServerUrl = process.env.VITE_DEV_SERVER_URL || "http://127.0.0.1:5173"
const electronDir = path.resolve("electron")
const electronConfig = path.resolve("electron/tsconfig.json")
const isWindows = process.platform === "win32"
const pnpmCmd = isWindows ? "pnpm.cmd" : "pnpm"
const electronCmd = isWindows ? "electron.cmd" : "electron"

let electronProcess = null
let rebuildTimer = null
let shuttingDown = false
let restarting = false
let building = false
let pendingRestart = false

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: false,
      ...options,
    })

    child.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`))
    })

    child.on("error", reject)
  })
}

async function waitForUrl(targetUrl, timeoutMs = 30000) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(targetUrl, { method: "HEAD" })
      if (response.ok || response.status === 405) return
    } catch {
      // Vite is still starting.
    }
    await delay(300)
  }

  throw new Error(`Timed out waiting for ${targetUrl}`)
}

async function buildElectronMain() {
  building = true
  try {
    await run(pnpmCmd, ["exec", "tsc", "-p", "electron/tsconfig.json"])
  } finally {
    building = false
  }
}

function killElectron() {
  return new Promise((resolve) => {
    if (!electronProcess) {
      resolve()
      return
    }

    const child = electronProcess
    electronProcess = null
    child.once("exit", () => resolve())
    child.kill("SIGTERM")
  })
}

function launchElectron() {
  if (process.env.ELECTRON_DEV_DRY_RUN === "1") {
    console.log(`[Tesserin] Dry run: Electron would launch against ${devServerUrl}`)
    return
  }

  electronProcess = spawn(electronCmd, ["."], {
    stdio: "inherit",
    shell: false,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: devServerUrl,
    },
  })

  electronProcess.on("exit", (code, signal) => {
    const expected = restarting || shuttingDown
    electronProcess = null

    if (!expected) {
      const detail = signal ? `signal ${signal}` : `code ${code ?? 0}`
      console.log(`[Tesserin] Electron exited (${detail})`)
      shutdown(code ?? 0)
    }
  })
}

async function restartElectron() {
  if (building) {
    pendingRestart = true
    return
  }

  restarting = true
  try {
    await buildElectronMain()
    await killElectron()
    launchElectron()
  } catch (error) {
    console.error("[Tesserin] Failed to restart Electron:", error)
  } finally {
    restarting = false
    if (pendingRestart) {
      pendingRestart = false
      restartElectron()
    }
  }
}

function scheduleRestart(filePath) {
  if (rebuildTimer) clearTimeout(rebuildTimer)
  rebuildTimer = setTimeout(() => {
    console.log(`[Tesserin] Detected Electron change: ${path.basename(filePath)}. Rebuilding...`)
    restartElectron()
  }, 150)
}

function watchElectronFiles() {
  const watcher = watch(electronDir, { persistent: true }, (_eventType, filename) => {
    if (!filename) return
    if (!filename.endsWith(".ts")) return
    scheduleRestart(path.join(electronDir, filename))
  })

  const configWatcher = watch(electronConfig, { persistent: true }, () => {
    scheduleRestart(electronConfig)
  })

  return [watcher, configWatcher]
}

async function shutdown(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true
  await killElectron()
  process.exit(exitCode)
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    shutdown(0)
  })
}

await waitForUrl(devServerUrl)
await buildElectronMain()
const watchers = watchElectronFiles()
launchElectron()

process.on("exit", () => {
  watchers.forEach((watcher) => watcher.close())
})
