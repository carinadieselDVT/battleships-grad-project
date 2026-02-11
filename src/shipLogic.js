class Ship {
  constructor(name, length) {
    this.name = name
    this.length = length
    this.positions = []
    this.placed = false
    this.hits = 0
  }

  place(startRow, startCol, direction) {
    this.positions = []
    for (let counter = 0; counter < this.length; counter++) {
      if (direction === 'horizontal') {
        this.positions.push({ row: startRow, col: startCol + counter })
      } else {
        this.positions.push({ row: startRow + counter, col: startCol })
      }
    }
    this.placed = true
  }
  // Logic for enemy return fire
  hit() {
    this.hits++
  }

  isSunk() {
    return this.hits >= this.length
  }
}
