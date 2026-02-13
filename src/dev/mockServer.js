// Simple mock server to simulate gameplay messages for local testing
// Use via index.html?mock=1

function makeEventTarget() {
  const listeners = new Map()
  return {
    addEventListener(type, handler) {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type).add(handler)
    },
    removeEventListener(type, handler) {
      listeners.get(type)?.delete(handler)
    },
    dispatchEvent(evt) {
      const set = listeners.get(evt.type)
      if (!set) return
      for (const h of [...set]) {
        try {
          h(evt)
        } catch (e) {
          console.error(e)
        }
      }
    },
    _listeners: listeners,
  }
}

function messageEvent(payload) {
  return { type: 'message', data: JSON.stringify(payload) }
}

function randomCoord(used) {
  while (true) {
    const r = Math.floor(Math.random() * 12)
    const c = Math.floor(Math.random() * 12)
    const coord = String.fromCharCode(65 + c) + (r + 1)
    if (!used.has(coord)) return coord
  }
}

export function createMockClient() {
  const target = makeEventTarget()

  // Minimal socket-like object
  const socket = {
    readyState: 1, // OPEN
    addEventListener: target.addEventListener,
    removeEventListener: target.removeEventListener,
    dispatchEvent: target.dispatchEvent,
    close(code = 1000, reason = 'normal') {
      socket.readyState = 3 // CLOSED
      setTimeout(() => target.dispatchEvent({ type: 'close', code, reason }), 0)
    },
    send(data) {
      try {
        const msg = typeof data === 'string' ? JSON.parse(data) : data
        handleClientMessage(msg)
      } catch (e) {
        console.error('Mock send parse error', e)
      }
    },
  }

  // Fire open event async
  setTimeout(() => target.dispatchEvent({ type: 'open' }), 0)

  // Game state for mock
  const player = {
    authed: false,
    shipsPlaced: false,
    shots: new Set(),
  }
  const ai = {
    shots: new Set(),
  }

  function emit(payload, delay = 0) {
    setTimeout(() => socket.dispatchEvent(messageEvent(payload)), delay)
  }

  function handleClientMessage(msg) {
    switch (msg.type) {
      case 'login': {
        player.authed = true
        emit(
          {
            type: 'auth_success',
            sessionToken: 'mock-token',
            user: {
              username: msg.username || 'player',
              stats: { gamesPlayed: 0, wins: 0, losses: 0 },
            },
          },
          50,
        )
        break
      }
      case 'logout': {
        player.authed = false
        emit({ type: 'logout_success' }, 50)
        break
      }
      case 'place_ships': {
        if (!player.authed) {
          emit(
            {
              type: 'error',
              code: 'UNAUTHORIZED',
              message: 'You must be logged in to perform this action',
            },
            10,
          )
          break
        }
        player.shipsPlaced = true
        emit({ type: 'ships_accepted' }, 50)
        // Start immediately with player's turn in mock
        emit({ type: 'game_start', yourTurn: true, opponent: 'Computer' }, 120)
        break
      }
      case 'shoot': {
        if (!player.authed || !player.shipsPlaced) break
        const coord = msg.coordinate
        if (!coord || player.shots.has(coord)) break
        player.shots.add(coord)
        // 45% hit chance
        const hit = Math.random() < 0.45
        emit({ type: 'shot_result', coordinate: coord, hit, sunk: null }, 60)
        emit({ type: 'turn_change', currentTurn: 'computer' }, 80)
        // Computer replies after short delay
        const aiCoord = randomCoord(ai.shots)
        ai.shots.add(aiCoord)
        emit({ type: 'shot_fired', coordinate: aiCoord, by: 'Computer' }, 650)
        emit({ type: 'turn_change', currentTurn: 'you' }, 700)
        break
      }
      case 'forfeit': {
        if (!player.authed || !player.shipsPlaced) break
        // Computer wins due to forfeit
        emit({ type: 'game_over', winner: 'Computer', reason: 'forfeit' }, 80)
        break
      }
      case 'list_players': {
        emit({ type: 'player_list', players: [] }, 20)
        break
      }
      case 'send_invite':
      case 'accept_invite':
      case 'decline_invite': {
        // No-op in mock for now
        break
      }
      default: {
        // Unknown; ignore
        break
      }
    }
  }

  // Shape like our real client wrapper
  return { socket }
}
