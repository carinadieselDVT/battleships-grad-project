export const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:3000`

import { WebsocketClient } from './websocketClient.js'
import { createMockClient } from './dev/mockServer.js'

let client = null

function isMockEnabled() {
  try {
    if (/[?&]mock=1/.test(location.search)) return true
    if (localStorage.getItem('mock') === '1') return true
  } catch {}
  return false
}

export function getClient() {
  const wantMock = isMockEnabled()
  if (
    !client ||
    client.socket.readyState === WebSocket.CLOSED ||
    client.socket.readyState === WebSocket.CLOSING
  ) {
    client = wantMock ? createMockClient() : new WebsocketClient(WS_URL)
  }
  return client
}
