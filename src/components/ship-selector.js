export class SelectShip extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <select id="ship-type">
        <option>Carrier</option>
        <option>Battleship</option>
        <option>Cruiser</option>
        <option>Submarine</option>
        <option>Destroyer</option>
      </select>
      <button id="rotate">Rotate</button>
    `

    this.querySelector('#ship-type').addEventListener('change', (event) => {
      this.dispatchEvent(
        // he dispatchEvent() method of the EventTarget sends an Event to the object, (synchronously) invoking the affected event listeners in the appropriate order.
        new CustomEvent('ship-changed', {
          // The CustomEvent() constructor creates a new CustomEvent object. new CustomEvent(type, options)
          detail: event.target.value,
          bubbles: true,
        }),
      )
    })

    this.querySelector('#rotate').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('ship-rotated', { bubbles: true }))
    })
  }
}

customElements.define('ship-selector', SelectShip)
