export class Board {
  constructor(containerId, isEnemy = false) {
    this.size = 12
    this.isEnemy = isEnemy
    this.container = document.getElementById(containerId)
    this.container.classList.add('board', isEnemy ? 'enemy' : 'player')

    // Visual state for shots taken on this board (hit/miss)
    this.state = Array.from({ length: this.size }, () =>
      Array(this.size).fill(null),
    )

    // Placement grid for player's own ships (references to Ship or null)
    this.grid = Array.from({ length: this.size }, () =>
      Array(this.size).fill(null),
    )

    // Placement helpers (player board only)
    this.currentShip = null
    this.direction = 'horizontal'

    // Selection for enemy targeting
    this.selectedCell = null
    this.firingEnabled = false

    this.render()
  }

  render() {
    this.container.innerHTML = ''
    this.container.style.display = 'grid'
    this.container.style.gridTemplateColumns = `var(--cell-size) repeat(12, var(--cell-size))`
    this.container.style.gridTemplateRows = `var(--cell-size) repeat(12, var(--cell-size))`

    for (let row = -1; row < this.size; row++) {
      for (let col = -1; col < this.size; col++) {
        const cell = document.createElement('div')

        if (row === -1 && col === -1) {
          cell.className = 'corner'
        } else if (row === -1) {
          cell.className = 'legend'
          cell.textContent = String.fromCharCode(65 + col)
          // It sets the cell’s visible text to a column letter.

          // String.fromCharCode(65 + col) converts a number to a character using its character code.
          // 65 is the char code for 'A', so:
          // col = 0 → 65 → 'A'
          // col = 1 → 66 → 'B'
          // …
          // col = 11 → 76 → 'L'

          // So cell.textContent = String.fromCharCode(65 + col) labels the column headers A–L for col 0–11.

          // Notes
          // It assumes 0-based columns and only covers single letters (max Z at col 25). If you ever need 26+ columns (AA, AB, …), you’d need a different converter.
          // textContent sets the DOM element’s text (what you see in the grid header).
        } else if (col === -1) {
          cell.className = 'legend'
          cell.textContent = row + 1
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

  // --- Coordinate helpers ---
  toCoordinate(row, col) {
    const letter = String.fromCharCode(65 + col) // A-L
    const number = row + 1 // 1-12
    return `${letter}${number}`
  }

  fromCoordinate(coord) {
    const letter = coord[0].toUpperCase()
    const col = letter.charCodeAt(0) - 65
    const row = parseInt(coord.slice(1), 10) - 1
    return { row, col }
  }

  // --- Enemy board methods ---
  setFiringEnabled(enabled) {
    this.firingEnabled = !!enabled
    // Clear selection when disabled
    if (!this.firingEnabled && this.selectedCell) {
      this._unhighlightSelected()
    }
  }

  _unhighlightSelected() {
    if (!this.selectedCell) return
    const row = Number(this.selectedCell.dataset.row)
    const col = Number(this.selectedCell.dataset.col)
    const state = this.state[row][col]
    // Restore visuals based on state rather than forcing grey
    if (state === 'hit') {
      this.selectedCell.classList.add('hit')
      this.selectedCell.style.backgroundColor = 'red'
    } else if (state === 'miss') {
      this.selectedCell.classList.add('miss')
      this.selectedCell.textContent = 'X'
      this.selectedCell.style.display = 'flex'
      this.selectedCell.style.justifyContent = 'center'
      this.selectedCell.style.alignItems = 'center'
      this.selectedCell.style.backgroundColor = '#e0e0e0'
      this.selectedCell.style.color = '#000000'
      this.selectedCell.style.fontWeight = 'bold'
    } else {
      // no result yet; just revert to base cell appearance
      this.selectedCell.style.backgroundColor = '#e0e0e0'
    }
    this.selectedCell = null
  }

  selectCell(cell) {
    if (!this.firingEnabled) return

    const row = Number(cell.dataset.row)
    const col = Number(cell.dataset.col)

    // Don't allow re-selecting an already resolved cell
    if (this.state[row][col]) return

    if (this.selectedCell) {
      this._unhighlightSelected()
    }

    this.selectedCell = cell
    cell.style.backgroundColor = 'yellow'
  }

  getSelectedCoordinate() {
    if (!this.selectedCell) return null
    const row = Number(this.selectedCell.dataset.row)
    const col = Number(this.selectedCell.dataset.col)
    return this.toCoordinate(row, col)
  }

  clearSelection() {
    // Restore visuals based on state so we don't overwrite hit/miss styling
    this._unhighlightSelected()
  }

  // Apply authoritative shot result from server to enemy board
  markShotResult(coord, hit) {
    const { row, col } = this.fromCoordinate(coord)
    if (row < 0 || col < 0 || row >= this.size || col >= this.size) return

    const cell = this.container.querySelector(
      `.grid-cell[data-row="${row}"][data-col="${col}"]`,
    )
    if (!cell) return

    this.state[row][col] = hit ? 'hit' : 'miss'

    if (hit) {
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

    // Now clear selection by restoring visuals, without overwriting the result
    if (this.selectedCell === cell) {
      this._unhighlightSelected()
    } else {
      this.clearSelection()
    }
  }

  // --- Player board placement logic ---
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

  // Apply opponent shot (from server) to our own board for UI only
  markIncomingShot(coord) {
    const { row, col } = this.fromCoordinate(coord)
    if (row < 0 || col < 0 || row >= this.size || col >= this.size) return

    const hit = this.grid[row][col] !== null
    this.state[row][col] = hit ? 'hit' : 'miss'

    const cell = this.container.querySelector(
      `.grid-cell[data-row="${row}"][data-col="${col}"]`,
    )
    if (!cell) return

    if (hit) {
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
  }
}
