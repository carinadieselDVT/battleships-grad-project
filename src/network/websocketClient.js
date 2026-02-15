export class WebsocketClient {
  constructor(url) {
    this.socket = new WebSocket(url)

    // Optional lightweight connection logs; enable via localStorage.wsDebug = '1'
    const debug = () => {
      try {
        return localStorage.getItem('wsDebug') === '1'
      } catch {
        return false
      }
    }

    this.socket.addEventListener('open', () => {
      if (debug()) console.log('[WS] open')
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
