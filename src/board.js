// Initialize board

const emptyBoard = []
let afterPlacementBoard = []
const initializeBoard = () => {
  const board = []
  for (let column = 0; column < 12; column++) {
    board[column] = []
    for (let row = 0; row < 12; row++) {
      board[column][row] = 0
    }
  }
  return board
}
const board = initializeBoard()
console.log(board)

// Select ship and horizontal/vertical and place

// Click on enemy board with fire
// Check if ship on position
// If ship,show red block
// If no ship,show "x"

// Additional : Clear board
// Add legend (A,B,C), (1,2,3)

// Ships
// Carrier: 5 connected tiles (e.g., dark gray or navy)
// Battleship: 4 connected tiles
// Cruiser: 3 connected tiles
// Submarine: 3 connected tiles
// Destroyer: 2 connected tiles
