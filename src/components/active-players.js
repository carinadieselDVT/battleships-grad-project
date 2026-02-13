export class ActivePlayers extends HTMLElement {
  constructor() {
    super()
    this.players = []
    // Map username -> { direction: 'incoming' | 'outgoing', inviteId: string }
    this.invitesByUsername = new Map()
  }

  connectedCallback() {
    this.render()
  }

  // Public API to set player list
  setPlayers(players) {
    // players: [{ username, gamesPlayed, wins, losses }]
    this.players = Array.isArray(players) ? players : []
    this.render()
  }

  // Public API to reflect invite state changes
  markIncomingInvite(username, inviteId) {
    if (!username || !inviteId) return
    this.invitesByUsername.set(username, { direction: 'incoming', inviteId })
    this.render()
  }

  markOutgoingInvite(username, inviteId) {
    if (!username || !inviteId) return
    this.invitesByUsername.set(username, { direction: 'outgoing', inviteId })
    this.render()
  }

  clearInviteById(inviteId) {
    if (!inviteId) return
    for (const [u, info] of this.invitesByUsername.entries()) {
      if (info.inviteId === inviteId) {
        this.invitesByUsername.delete(u)
        break
      }
    }
    this.render()
  }

  render() {
    const rows = this.players
      .map((p) => {
        const invite = this.invitesByUsername.get(p.username)
        const isIncoming = invite?.direction === 'incoming'
        const isOutgoing = invite?.direction === 'outgoing'

        const actionBtn = isIncoming
          ? `
              <div class=\"incoming-actions\">
                <button class=\"btn-accept\" data-action=\"accept\" data-username=\"${p.username}\" data-inviteid=\"${invite.inviteId}\">Accept</button>
                <button class=\"btn-decline\" data-action=\"decline\" data-username=\"${p.username}\" data-inviteid=\"${invite.inviteId}\">Decline Invite</button>
              </div>
            `
          : `<button class=\"btn-invite\" data-action=\"invite\" data-username=\"${p.username}\">Invite</button>`

        const outgoingBadge = isOutgoing
          ? `<span class="badge badge-pending" title="Invite sent">Pending</span>`
          : ''

        return `
          <div class="player-row">
            <div class="col identity">
              <div class="username">${p.username}</div>
              ${outgoingBadge}
            </div>
            <div class="col stats">
              <span class="stat"><strong>G</strong>: ${p.gamesPlayed ?? 0}</span>
              <span class="stat"><strong>W</strong>: ${p.wins ?? 0}</span>
              <span class="stat"><strong>L</strong>: ${p.losses ?? 0}</span>
            </div>
            <div class="col actions">${actionBtn}</div>
          </div>`
      })
      .join('')

    this.innerHTML = `
      <section class="players-panel">
        <header class="players-header">
          <h3>Active Players</h3>
        </header>
        <div class="players-list">
          ${rows || '<div class="empty">No active players</div>'}
        </div>
      </section>
    `

    this.wireEvents()
  }

  wireEvents() {
    this.querySelectorAll('[data-action="invite"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const username = btn.getAttribute('data-username')
        this.dispatchEvent(
          new CustomEvent('invite', { detail: { username }, bubbles: true }),
        )
      })
    })

    this.querySelectorAll('[data-action=\"decline\"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const username = btn.getAttribute('data-username')
        const inviteId = btn.getAttribute('data-inviteid')
        this.dispatchEvent(
          new CustomEvent('decline-invite', {
            detail: { username, inviteId },
            bubbles: true,
          }),
        )
      })
    })

    this.querySelectorAll('[data-action=\"accept\"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const username = btn.getAttribute('data-username')
        const inviteId = btn.getAttribute('data-inviteid')
        this.dispatchEvent(
          new CustomEvent('accept-invite', {
            detail: { username, inviteId },
            bubbles: true,
          }),
        )
      })
    })
  }
}

customElements.define('active-players', ActivePlayers)
