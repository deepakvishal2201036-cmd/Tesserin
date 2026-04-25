const targetUrl = process.argv[2] || "http://127.0.0.1:5173"
const timeoutMs = Number(process.env.WAIT_FOR_URL_TIMEOUT_MS || 30000)
const startedAt = Date.now()

async function waitForUrl() {
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(targetUrl, { method: "HEAD" })
      if (response.ok || response.status === 405) return
    } catch {
      // Dev server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  console.error(`Timed out waiting for ${targetUrl}`)
  process.exit(1)
}

await waitForUrl()
