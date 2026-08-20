import { guestbookEmitter } from '@/lib/events'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection acknowledgment
      controller.enqueue(encoder.encode(`event: connected\ndata: {"status":"connected"}\n\n`))

      const onNewEntry = (data: unknown) => {
        try {
          const payload = `event: new-entry\ndata: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(payload))
        } catch (err) {
          console.error('SSE enqueue error:', err)
        }
      }

      guestbookEmitter.on('guestbook-entry-added', onNewEntry)

      // Send keep-alive heartbeat every 15 seconds
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`:\n\n`))
        } catch {
          // Stream closed
          clearInterval(heartbeatInterval)
        }
      }, 15000)

      request.signal.addEventListener('abort', () => {
        guestbookEmitter.off('guestbook-entry-added', onNewEntry)
        clearInterval(heartbeatInterval)
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
