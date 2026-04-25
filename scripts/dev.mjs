import { spawn } from "node:child_process"
import net from "node:net"
import { setTimeout as delay } from "node:timers/promises"

const host = "127.0.0.1"
const defaultPort = Number(process.env.VITE_DEV_PORT || 5173)
const maxPort = Number(process.env.VITE_DEV_MAX_PORT || defaultPort + 20)
const dryRun = process.env.TESSERIN_DEV_DRY_RUN === "1"

const isWindows = process.platform === "win32"
const pnpmCmd = isWindows ? "pnpm.cmd" : "pnpm"

let viteProcess = null
let electronProcess = null
let shuttingDown = false

function spawnChild(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: false,
    ...options,
  })

  child.on("error", (error) => {
    console.error(`[Tesserin] Failed to start ${command}:`, error)
    shutdown(1)
  })

  return child
}

function waitForExit(child) {
  return new Promise((resolve) => {
    if (!child) {
      resolve()
      return
    }

    child.once("exit", () => resolve())
  })
}

async function killChild(child) {
  if (!child || child.killed) return

  child.kill("SIGTERM")
  await Promise.race([
    waitForExit(child),
    delay(3000).then(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill("SIGKILL")
      }
    }),
  ])
}

function canBind(port) {
  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.once("error", (error) => {
      server.close()
      if (
        error.code === "EADDRINUSE" ||
        error.code === "EACCES" ||
        error.code === "EPERM"
      ) {
        resolve(false)
        return
      }
      reject(error)
    })

    server.once("listening", () => {
      server.close(() => resolve(true))
    })

    server.listen(port, host)
  })
}

async function findAvailablePort(startPort, endPort) {
  for (let port = startPort; port <= endPort; port += 1) {
    if (await canBind(port)) return port
  }

  throw new Error(
    `No free renderer port found between ${startPort} and ${endPort}.`,
  )
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

async function shutdown(exitCode = 0) {
  if (shuttingDown) return
  shuttingDown = true

  await Promise.allSettled([
    killChild(electronProcess),
    killChild(viteProcess),
  ])

  process.exit(exitCode)
}

function attachExitLogging(child, label) {
  child.on("exit", (code, signal) => {
    if (shuttingDown) return

    const detail = signal ? `signal ${signal}` : `code ${code ?? 0}`
    console.log(`[Tesserin] ${label} exited (${detail})`)
    shutdown(code ?? 0)
  })
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    shutdown(0)
  })
}

const port = await findAvailablePort(defaultPort, maxPort)
const devServerUrl = `http://${host}:${port}`

if (port !== defaultPort) {
  console.log(
    `[Tesserin] Port ${defaultPort} is already in use. Starting the renderer on ${port} instead.`,
  )
}

if (dryRun) {
  console.log(`[Tesserin] Dry run: dev server would use ${devServerUrl}`)
  process.exit(0)
}

viteProcess = spawnChild(pnpmCmd, [
  "exec",
  "vite",
  "--host",
  host,
  "--port",
  String(port),
  "--strictPort",
])
attachExitLogging(viteProcess, "Vite")

try {
  await waitForUrl(devServerUrl)
} catch (error) {
  console.error("[Tesserin] Renderer failed to start:", error)
  await shutdown(1)
}

console.log(`[Tesserin] Renderer ready at ${devServerUrl}`)

electronProcess = spawnChild(pnpmCmd, ["electron:dev"], {
  env: {
    ...process.env,
    VITE_DEV_SERVER_URL: devServerUrl,
  },
})
attachExitLogging(electronProcess, "Electron")
