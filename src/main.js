import { Ship } from './shipLogic.js'
import { Board } from './boardLogic.js'
import './components/ship-selector.js'
import './components/login-screen.js'
import './components/active-players.js'
import { getClient } from './wsSession.js'

// Theme toggle and persistence
const themeBtn = document.getElementById('theme-toggle')

function applyTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', t)
  try {
    localStorage.setItem('theme', t)
  } catch {}
  if (themeBtn) themeBtn.textContent = t === 'dark' ? 'Light mode' : 'Dark mode'
}

;(function initTheme() {
  try {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      applyTheme(saved)
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(systemDark ? 'dark' : 'light')
    }
  } catch {
    applyTheme('light')
  }
})()

themeBtn?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light'
  applyTheme(current === 'dark' ? 'light' : 'dark')
})

const carrier = new Ship('Carrier', 5)
const battleship = new Ship('Battleship', 4)
const cruiser = new Ship('Cruiser', 3)
const submarine = new Ship('Submarine', 3)
const destroyer = new Ship('Destroyer', 2)
const fleet = [carrier, battleship, cruiser, submarine, destroyer]

const playerBoard = new Board('player-board', false)
const enemyBoard = new Board('enemy-board', true)

// Default ship
playerBoard.currentShip = fleet[0]

const shipSelector = document.querySelector('ship-selector')

shipSelector.addEventListener('ship-changed', (e) => {
  const type = e.detail
  playerBoard.currentShip = fleet.find((ship) => ship.name === type)
})
shipSelector.addEventListener('ship-rotated', () => {
  playerBoard.direction =
    playerBoard.direction === 'horizontal' ? 'vertical' : 'horizontal'
})

// UI controls
const fireButton = document.getElementById('fire-button')
const readyButton = document.getElementById('ready-button')
const forfeitButton = document.getElementById('forfeit-button')
const statusEl = document.getElementById('status-text')
const overlay = document.querySelector('login-overlay')

const ws = getClient()

let isAuthed = false

// Game/turn state
let yourTurn = false
let opponentUsername = null
let inGame = false

// Shot debounce state
let shotPending = false
let lastSentCoord = null
let pendingTimer = null

function setTurnState(turn) {
  yourTurn = !!turn
  enemyBoard.setFiringEnabled(inGame && yourTurn)
  // Gate the Fire button by turn and pending status
  if (fireButton) fireButton.disabled = !inGame || !yourTurn || shotPending
  if (statusEl)
    statusEl.textContent = inGame
      ? yourTurn
        ? 'Your turn'
        : "Opponent's turn"
      : 'Not in a game'
}

// Login overlay -> server login
overlay?.addEventListener('login', (e) => {
  const { username, password } = e.detail
  if (!username || !password) return
  console.log('[SEND] login', { username })
  if (ws?.socket?.readyState === WebSocket.OPEN) {
    ws.socket.send(JSON.stringify({ type: 'login', username, password }))
  } else {
    ws.socket.addEventListener(
      'open',
      () =>
        ws.socket.send(JSON.stringify({ type: 'login', username, password })),
      { once: true },
    )
  }
})

function shipToServerSpec(ship) {
  // Derive orientation and start from placed positions
  if (
    !ship?.placed ||
    !Array.isArray(ship.positions) ||
    ship.positions.length === 0
  )
    return null
  const sameRow = ship.positions.every((p) => p.row === ship.positions[0].row)
  const orientation = sameRow ? 'horizontal' : 'vertical'
  const minRow = Math.min(...ship.positions.map((p) => p.row))
  const minCol = Math.min(...ship.positions.map((p) => p.col))
  const start = playerBoard.toCoordinate(minRow, minCol)
  const type = ship.name.toLowerCase()
  return { type, start, orientation }
}

function allShipsPlaced() {
  return fleet.every((s) => s.placed)
}

function sendPlaceShips() {
  if (!isAuthed) {
    alert('Please log in first')
    overlay?.show?.()
    return
  }
  if (!allShipsPlaced()) {
    alert('Place all ships before readying up')
    return
  }
  const ships = fleet.map(shipToServerSpec)
  console.log('[SEND] place_ships', ships)
  if (ws?.socket?.readyState === WebSocket.OPEN) {
    ws.socket.send(JSON.stringify({ type: 'place_ships', ships }))
  } else {
    ws.socket.addEventListener(
      'open',
      () => {
        ws.socket.send(JSON.stringify({ type: 'place_ships', ships }))
      },
      { once: true },
    )
  }
}

readyButton?.addEventListener('click', sendPlaceShips)

forfeitButton?.addEventListener('click', () => {
  if (!inGame) return
  const yes = confirm('Are you sure you want to forfeit this game?')
  if (!yes) return
  console.log('[SEND] forfeit')
  if (ws?.socket?.readyState === WebSocket.OPEN) {
    ws.socket.send(JSON.stringify({ type: 'forfeit' }))
  }
  // Prevent further actions until server responds
  fireButton && (fireButton.disabled = true)
  forfeitButton && (forfeitButton.disabled = true)
})

fireButton?.addEventListener('click', () => {
  if (!yourTurn) {
    alert('Wait for your turn')
    return
  }
  if (shotPending) return
  const coord = enemyBoard.getSelectedCoordinate()
  if (!coord) {
    alert('Select a target coordinate first')
    return
  }
  if (ws?.socket?.readyState === WebSocket.OPEN) {
    shotPending = true
    lastSentCoord = coord
    fireButton.disabled = true
    console.log('[SEND] shoot', { coordinate: coord })
    // Optional safety timeout in case a response never arrives
    clearTimeout(pendingTimer)
    pendingTimer = setTimeout(() => {
      shotPending = false
      if (yourTurn && fireButton) fireButton.disabled = false
      console.warn('[WARN] No shot_result received for', lastSentCoord)
    }, 4000)
    ws.socket.send(JSON.stringify({ type: 'shoot', coordinate: coord }))
  }
})

// Handle server messages for gameplay and auth
ws.socket.addEventListener('message', (event) => {
  try {
    const data = JSON.parse(event.data)
    switch (data.type) {
      case 'auth_success': {
        console.log('[RECV] auth_success', data)
        isAuthed = true
        if (data.sessionToken)
          sessionStorage.setItem('sessionToken', data.sessionToken)
        overlay?.hide?.()
        statusEl && (statusEl.textContent = 'Place your ships, then Ready up')
        break
      }
      case 'auth_error': {
        console.log('[RECV] auth_error', data)
        isAuthed = false
        alert(data.message || 'Authentication failed')
        overlay?.show?.()
        break
      }
      case 'logout_success': {
        console.log('[RECV] logout_success')
        isAuthed = false
        overlay?.show?.()
        statusEl && (statusEl.textContent = 'Logged out')
        break
      }
      case 'kicked': {
        console.log('[RECV] kicked', data)
        isAuthed = false
        overlay?.show?.()
        alert('You were signed out: ' + (data.reason || 'kicked'))
        break
      }
      case 'ships_accepted': {
        console.log('[RECV] ships_accepted')
        statusEl && (statusEl.textContent = 'Waiting for opponent...')
        break
      }
      case 'ships_rejected': {
        console.log('[RECV] ships_rejected', data)
        alert((data.errors || []).join('\n') || 'Ship placement rejected')
        break
      }
      case 'waiting_for_opponent': {
        console.log('[RECV] waiting_for_opponent')
        statusEl && (statusEl.textContent = 'Waiting for opponent...')
        break
      }
      case 'game_start': {
        console.log('[RECV] game_start', data)
        opponentUsername = data.opponent || null
        inGame = true
        forfeitButton && (forfeitButton.disabled = false)
        setTurnState(!!data.yourTurn)
        break
      }
      case 'shot_result': {
        // Applies to shooter (us)
        const { coordinate, hit } = data
        console.log('[RECV] shot_result', { coordinate, hit })
        if (coordinate != null && typeof hit === 'boolean') {
          enemyBoard.markShotResult(coordinate, hit)
        }
        // Clear pending if it matches our last sent shot (be tolerant to mismatch too)
        if (shotPending && (!lastSentCoord || lastSentCoord === coordinate)) {
          console.log('[STATE] shot resolved', { coordinate })
          shotPending = false
          clearTimeout(pendingTimer)
          // Button remains disabled if turn already flipped; otherwise re-enable
          if (yourTurn && fireButton) fireButton.disabled = false
        }
        break
      }
      case 'shot_fired': {
        // Opponent fired at us
        console.log('[RECV] shot_fired', {
          coordinate: data.coordinate,
          by: data.by,
        })
        if (data.by && opponentUsername && data.by !== opponentUsername) {
          // Ignore broadcasts not from our current opponent
          break
        }
        if (data.coordinate) {
          playerBoard.markIncomingShot(data.coordinate)
        }
        break
      }
      case 'ship_sunk': {
        // Optionally reflect sunk state in UI; for now, just notify
        console.log('[RECV] ship_sunk', {
          shipType: data.shipType,
          player: data.player,
        })
        break
      }
      case 'turn_change': {
        // Server advances turn after each shot; toggle locally
        const before = yourTurn
        setTurnState(!yourTurn)
        console.log('[RECV] turn_change', { before, after: yourTurn })
        // Any pending shot is now resolved by definition of a turn flip
        if (shotPending) {
          console.log('[STATE] clearing pending due to turn change')
          shotPending = false
          clearTimeout(pendingTimer)
        }
        break
      }
      case 'game_over': {
        console.log('[RECV] game_over', data)
        alert(`Game over. Winner: ${data.winner}. Reason: ${data.reason}`)
        inGame = false
        // Disable actions and targeting
        enemyBoard.setFiringEnabled(false)
        fireButton && (fireButton.disabled = true)
        forfeitButton && (forfeitButton.disabled = true)
        setTurnState(false)
        break
      }
      case 'opponent_disconnected': {
        console.log('[RECV] opponent_disconnected', data)
        statusEl && (statusEl.textContent = 'Opponent disconnected. Waiting...')
        break
      }
      case 'opponent_reconnected': {
        console.log('[RECV] opponent_reconnected')
        statusEl &&
          (statusEl.textContent = yourTurn ? 'Your turn' : "Opponent's turn")
        break
      }
    }
  } catch {
    // Non-JSON messages
    console.log(event.data)
  }
})

// If mock mode is on, add a badge for clarity
try {
  if (
    /[?&]mock=1/.test(location.search) ||
    localStorage.getItem('mock') === '1'
  ) {
    const badge = document.createElement('div')
    badge.textContent = 'MOCK MODE'
    Object.assign(badge.style, {
      position: 'fixed',
      right: '8px',
      bottom: '8px',
      padding: '4px 8px',
      background: '#444',
      color: '#fff',
      fontSize: '12px',
      borderRadius: '4px',
      opacity: '0.8',
      zIndex: 9999,
    })
    document.body.appendChild(badge)
  }
} catch {}

// Boards and gameplay remain on main.js; lobby logic is in src/pages/lobby.js
