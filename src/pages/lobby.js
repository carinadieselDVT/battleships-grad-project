import '../components/login-screen.js'
import '../components/active-players.js'
import { getClient } from '../network/wsSession.js'

// Elements present only on lobby
const overlay = document.querySelector('login-overlay')
const playersEl = document.querySelector('active-players')
// Hide players list until authenticated
if (playersEl) playersEl.style.display = 'none'

const registerForm = document.querySelector('form')
const registerEmailInput = document.getElementById('email')
const registerPasswordInput = document.getElementById('psw')
const loginBox = document.querySelector('.login-box')
const loginUsernameInput = document.getElementById('username')
const loginPasswordInput = document.getElementById('password')
const loginButton = document.getElementById('login-button')

// Optional: logout button in nav
const logoutButton = document.getElementById('logout-button')

// Using shared WebSocket session across views

// Shared WebSocket client across views
let ws = getClient()
ws.socket.addEventListener('message', onMessage)

function ensureWS(openCallback) {
  ws = getClient()
  if (openCallback && ws.socket.readyState !== WebSocket.OPEN) {
    const onceOpen = () => {
      ws.socket.removeEventListener('open', onceOpen)
      openCallback()
    }
    ws.socket.addEventListener('open', onceOpen)
  }
  return ws
}

// Track last attempted credentials for helpful retry flows
let lastAuthAttempt = { username: '', password: '' }

// Overlay-based login (if overlay is used)
overlay?.addEventListener('login', (e) => {
  const { username, password } = e.detail
  lastAuthAttempt = { username, password }
  ensureWS(() =>
    ws.socket.send(JSON.stringify({ type: 'login', username, password })),
  )
  if (ws.socket.readyState === WebSocket.OPEN) {
    ws.socket.send(JSON.stringify({ type: 'login', username, password }))
  }
})

// In-page login box
loginButton?.addEventListener('click', (e) => {
  e.preventDefault()
  const username = loginUsernameInput?.value?.trim()
  const password = loginPasswordInput?.value ?? ''
  if (!username || !password) {
    alert('Enter username and password')
    return
  }
  lastAuthAttempt = { username, password }
  ensureWS(() =>
    ws.socket.send(JSON.stringify({ type: 'login', username, password })),
  )
  if (ws.socket.readyState === WebSocket.OPEN) {
    ws.socket.send(JSON.stringify({ type: 'login', username, password }))
  }
})

// Registration form -> register message
registerForm?.addEventListener('submit', (e) => {
  e.preventDefault()
  const username = registerEmailInput?.value?.trim() // using email field as username per README example
  const password = registerPasswordInput?.value ?? ''
  if (!username || !password) {
    alert('Enter email/username and password')
    return
  }
  lastAuthAttempt = { username, password }
  ensureWS(() =>
    ws.socket.send(JSON.stringify({ type: 'register', username, password })),
  )
  if (ws.socket.readyState === WebSocket.OPEN) {
    ws.socket.send(JSON.stringify({ type: 'register', username, password }))
  }
})

// Logout
logoutButton?.addEventListener('click', (e) => {
  e.preventDefault()
  ensureWS(() => ws.socket.send(JSON.stringify({ type: 'logout' })))
  if (ws?.socket?.readyState === WebSocket.OPEN) {
    ws.socket.send(JSON.stringify({ type: 'logout' }))
  }
})

function onMessage(event) {
  try {
    const data = JSON.parse(event.data)
    switch (data.type) {
      case 'auth_success': {
        // Store token for potential reconnects (optional)
        if (data.sessionToken)
          sessionStorage.setItem('sessionToken', data.sessionToken)
        overlay?.hide()
        // Hide in-page auth UI
        registerForm && (registerForm.style.display = 'none')
        loginBox && (loginBox.style.display = 'none')
        // Show players list now that we are authenticated
        playersEl && (playersEl.style.display = '')
        ws.socket.send(JSON.stringify({ type: 'list_players' }))
        break
      }
      case 'auth_error': {
        const msg = data.message || 'Authentication failed'
        // Offer to register if creds unknown
        if (
          msg.toLowerCase().includes('invalid username or password') &&
          lastAuthAttempt.username &&
          lastAuthAttempt.password
        ) {
          const shouldRegister = confirm(
            `No account found for "${lastAuthAttempt.username}". Register this username now?`,
          )
          if (shouldRegister) {
            ws.socket.send(
              JSON.stringify({
                type: 'register',
                username: lastAuthAttempt.username,
                password: lastAuthAttempt.password,
              }),
            )
            break
          }
        }
        alert(msg)
        break
      }
      case 'logout_success': {
        // Show auth UI again
        registerForm && (registerForm.style.display = '')
        loginBox && (loginBox.style.display = '')
        overlay?.show?.()
        // Hide and clear players list on logout
        playersEl && (playersEl.style.display = 'none')
        playersEl?.setPlayers([])
        // We keep the shared socket open; server session is now unauthenticated
        break
      }
      case 'kicked': {
        // On being kicked due to login elsewhere, ensure UI is reset
        registerForm && (registerForm.style.display = '')
        loginBox && (loginBox.style.display = '')
        overlay?.show()
        // Hide and clear players list on kick
        playersEl && (playersEl.style.display = 'none')
        playersEl?.setPlayers([])
        alert('You were signed out: ' + (data.reason || 'kicked'))
        break
      }
      case 'player_list': {
        const list = (data.players || []).map((p) => ({
          username: p.username,
          gamesPlayed: p.stats?.gamesPlayed ?? 0,
          wins: p.stats?.wins ?? 0,
          losses: p.stats?.losses ?? 0,
        }))
        playersEl?.setPlayers(list)
        break
      }
      case 'invite_received':
        playersEl?.markIncomingInvite(data.from, data.inviteId)
        break
      case 'invite_sent':
        playersEl?.markOutgoingInvite(data.to, data.inviteId)
        break
      case 'invite_declined':
      case 'invite_accepted':
        playersEl?.clearInviteById(data.inviteId)
        break
    }
  } catch {
    console.log(event.data)
  }
}

// UI -> server
playersEl?.addEventListener('invite', (e) => {
  const { username } = e.detail
  ensureWS(() =>
    ws.socket.send(
      JSON.stringify({ type: 'send_invite', targetUsername: username }),
    ),
  )
  if (ws?.socket?.readyState === WebSocket.OPEN) {
    ws.socket.send(
      JSON.stringify({ type: 'send_invite', targetUsername: username }),
    )
  }
})
playersEl?.addEventListener('decline-invite', (e) => {
  const { inviteId } = e.detail
  ensureWS(() =>
    ws.socket.send(JSON.stringify({ type: 'decline_invite', inviteId })),
  )
  if (ws?.socket?.readyState === WebSocket.OPEN) {
    ws.socket.send(JSON.stringify({ type: 'decline_invite', inviteId }))
  }
})
playersEl?.addEventListener('accept-invite', (e) => {
  const { inviteId } = e.detail
  ensureWS(() =>
    ws.socket.send(JSON.stringify({ type: 'accept_invite', inviteId })),
  )
  if (ws?.socket?.readyState === WebSocket.OPEN) {
    ws.socket.send(JSON.stringify({ type: 'accept_invite', inviteId }))
  }
})
