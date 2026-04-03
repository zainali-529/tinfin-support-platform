import { WebSocketServer, WebSocket } from 'ws'
import { IncomingMessage } from 'http'

interface TinfinSocket extends WebSocket {
  orgId?: string
  visitorId?: string
  isAlive?: boolean
  isAgent?: boolean
}

const rooms = new Map<string, Set<TinfinSocket>>()

function send(socket: TinfinSocket, data: unknown) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data))
  }
}

function broadcastToAgents(orgId: string, data: unknown) {
  rooms.get(orgId)?.forEach(s => {
    if (s.isAgent && s.readyState === WebSocket.OPEN) {
      s.send(JSON.stringify(data))
    }
  })
}

export function createWsServer(port: number) {
  const wss = new WebSocketServer({ port })

  wss.on('connection', (socket: TinfinSocket, req: IncomingMessage) => {
    const url = new URL(req.url || '/', `http://localhost`)
    const orgId = url.searchParams.get('orgId') || ''
    const visitorId = url.searchParams.get('visitorId') || crypto.randomUUID()
    const isAgent = url.searchParams.get('type') === 'agent'

    if (!orgId) return socket.close(1008, 'orgId required')

    socket.orgId = orgId
    socket.visitorId = visitorId
    socket.isAgent = isAgent
    socket.isAlive = true

    if (!rooms.has(orgId)) rooms.set(orgId, new Set())
    rooms.get(orgId)!.add(socket)

    send(socket, { type: 'connected', visitorId })

    socket.on('pong', () => { socket.isAlive = true })

    socket.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        handleMessage(socket, msg)
      } catch {}
    })

    socket.on('close', () => {
      rooms.get(orgId)?.delete(socket)
      if (rooms.get(orgId)?.size === 0) rooms.delete(orgId)
    })

    socket.on('error', () => socket.terminate())
  })

  setInterval(() => {
    wss.clients.forEach((ws) => {
      const s = ws as TinfinSocket
      if (!s.isAlive) return s.terminate()
      s.isAlive = false
      s.ping()
    })
  }, 30_000)

  console.log(`WS: ws://localhost:${port}`)
  return wss
}

function handleMessage(socket: TinfinSocket, msg: Record<string, unknown>) {
  const { type } = msg

  switch (type) {
    case 'visitor:message': {
      // 1. Broadcast to agents only
      broadcastToAgents(socket.orgId!, {
        type: 'visitor:message',
        visitorId: socket.visitorId,
        content: msg.content,
        conversationId: msg.conversationId,
        createdAt: new Date().toISOString(),
      })

      // 2. AI typing — only to sender
      setTimeout(() => send(socket, { type: 'typing:start' }), 400)

      // 3. AI response — only to sender
      setTimeout(() => {
        send(socket, { type: 'typing:stop' })
        send(socket, {
          type: 'ai:response',
          content: 'Thanks for reaching out! AI pipeline is being connected.',
          conversationId: msg.conversationId,
          createdAt: new Date().toISOString(),
        })
      }, 2200)
      break
    }

    case 'agent:message': {
      // Find visitor socket by conversationId and send
      rooms.get(socket.orgId!)?.forEach(s => {
        if (!s.isAgent && s.readyState === WebSocket.OPEN) {
          send(s, {
            type: 'agent:message',
            content: msg.content,
            conversationId: msg.conversationId,
            createdAt: new Date().toISOString(),
          })
        }
      })
      // Echo to sender agent
      send(socket, { type: 'message:sent', conversationId: msg.conversationId })
      break
    }

    case 'typing:start':
    case 'typing:stop': {
      broadcastToAgents(socket.orgId!, { type, visitorId: socket.visitorId })
      break
    }

    case 'ping':
      send(socket, { type: 'pong' })
      break
  }
}