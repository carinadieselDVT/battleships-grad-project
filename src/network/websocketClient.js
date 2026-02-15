import RobustWebSocket from 'robust-websocket'

export class WebsocketClient {
  constructor(url) {
    // Auto-reconnecting WebSocket with simple policy: always reconnect
    this.socket = new RobustWebSocket(url, [], {
      shouldReconnect: () => true, // reconnect on any close
    })

    // Optional lightweight connection logs; enable via localStorage.wsDebug = '1'
    const debug = () => {
      try {
        return localStorage.getItem('wsDebug') === '1'
      } catch {
        return false
      }
    }

    this.socket.addEventListener('open', () => {
      if (debug()) console.log('[WS] open (robust)')
    })

    this.socket.addEventListener('close', (evt) => {
      if (debug())
        console.log('[WS] close', { code: evt.code, reason: evt.reason })
    })

    this.socket.addEventListener('error', (err) => {
      if (debug()) console.error('[WS] error', err)
    })
  }

  send(action, payload) {
    const message = { type: action, ...payload }
    this.socket.send(JSON.stringify(message))
  }
}
