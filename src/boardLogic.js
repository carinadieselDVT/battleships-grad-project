export class Board {
  constructor(containerId, isEnemy = false) {
    this.size = 12
    this.isEnemy = isEnemy
    this.container = document.getElementById(containerId)
    this.container.classList.add('board', isEnemy ? 'enemy' : 'player')

    this.state = Array.from({ length: this.size }, () =>
      Array(this.size).fill(null),
    )

    this.grid = Array.from({ length: this.size }, () =>
      Array(this.size).fill(null),
    )

    this.currentShip = null
    this.direction = 'horizontal'
    this.selectedCell = null

    this.render()
  }

  render() {
    this.container.innerHTML = ''
    this.container.style.display = 'grid'
    this.container.style.gridTemplateColumns = `var(--cell-size) repeat(12, var(--cell-size))`;
    this.container.style.gridTemplateRows = `var(--cell-size) repeat(12, var(--cell-size))`

    for (let row = -1; row < this.size; row++) {
      for (let col = -1; col < this.size; col++) {
        const cell = document.createElement('div')

        if (row === -1 && col === -1) {
          cell.className = 'corner'
        } else if (row === -1) {
          cell.className = 'legend'
          cell.textContent = col + 1
        } else if (col === -1) {
          cell.className = 'legend'
          cell.textContent = String.fromCharCode(65 + row)
        } else {
          cell.className = 'grid-cell'
          cell.dataset.row = row
          cell.dataset.col = col

          const state = this.state[row][col]
          if (state === 'hit') {
            cell.classList.add('hit')
            cell.style.backgroundColor = 'red'
          } else if (state === 'miss') {
            cell.classList.add('miss')
            cell.textContent = 'X'
            cell.style.display = 'flex'
            cell.style.justifyContent = 'center'
            cell.style.alignItems = 'center'
          }

          if (this.isEnemy) {
            cell.addEventListener('click', () => this.selectCell(cell))
          } else {
            cell.addEventListener('click', (event) =>
              this.handleCellClick(event),
            )
          }
        }

        this.container.appendChild(cell)
      }
    }
  }

  // Enemy board methods
  selectCell(cell) {
    const row = Number(cell.dataset.row)
    const col = Number(cell.dataset.col)

    if (this.state[row][col]) return

    if (this.selectedCell) {
      this.selectedCell.style.backgroundColor = '#e0e0e0'
    }

    this.selectedCell = cell
    cell.style.backgroundColor = 'yellow'
  }

  fire() {
    if (!this.selectedCell) {
      alert('Please select a position first')
      return
    }

    const cell = this.selectedCell
    const row = Number(cell.dataset.row)
    const col = Number(cell.dataset.col)

    if (this.state[row][col]) return

    const isHit = Math.random() < 0.5
    this.state[row][col] = isHit ? 'hit' : 'miss'

    if (isHit) {
      cell.classList.add('hit')
      cell.style.backgroundColor = 'red'
    } else {
      cell.classList.add('miss')
      cell.textContent = 'X'
      cell.style.display = 'flex'
      cell.style.justifyContent = 'center'
      cell.style.alignItems = 'center'
      cell.style.backgroundColor = '#e0e0e0'
      cell.style.color = '#000000'
      cell.style.fontWeight = 'bold'
    }

    this.selectedCell = null
  }

  // Own board selection logic
  canPlaceShip(ship, row, col, direction) {
    for (let counter = 0; counter < ship.length; counter++) {
      const rowDirection = direction === 'horizontal' ? row : row + counter
      const colDirection = direction === 'horizontal' ? col + counter : col
      if (rowDirection >= this.size || colDirection >= this.size) return false
      if (this.grid[rowDirection][colDirection] !== null) return false
    }
    return true
  }

  placeShip(ship, row, col, direction) {
    if (!this.canPlaceShip(ship, row, col, direction)) return false

    ship.place(row, col, direction)

    ship.positions.forEach((position) => {
      this.grid[position.row][position.col] = ship
    })

    return true
  }

  handleCellClick(event) {
    const row = Number(event.target.dataset.row)
    const col = Number(event.target.dataset.col)

    if (!this.currentShip) return
    if (this.currentShip.placed) return

    const success = this.placeShip(this.currentShip, row, col, this.direction)
    if (!success) return

    this.renderShip(this.currentShip)
  }

  renderShip(ship) {
    ship.positions.forEach((position) => {
      const cell = this.container.querySelector(
        `.grid-cell[data-row="${position.row}"][data-col="${position.col}"]`,
      )
      if (cell) cell.classList.add('ship')
    })
  }
}
