export class LoginOverlay extends HTMLElement {
  connectedCallback() {
    // Success or kicked state
    this.innerHTML = `
      <div class="overlay">
        <div class="login-box">
          <h2>Login</h2>
          <input type="text" placeholder="Username" id="username" />
          <input type="password" placeholder="Password" id="password" />
          <button id="login-button">Login</button>
        </div>
      </div>
    `

    this.querySelector('#login-button').addEventListener('click', () => {
      const username = this.querySelector('#username').value
      const password = this.querySelector('#password').value
      this.dispatchEvent(
        new CustomEvent('login', {
          detail: { username, password },
          bubbles: true,
        }),
      )
    })
  }

  show() {
    this.style.display = 'flex'
  }
  hide() {
    this.style.display = 'none'
  }
}

customElements.define('login-overlay', LoginOverlay)
