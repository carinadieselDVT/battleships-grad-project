const carrier = new Ship('Carrier', 5)
const battleship = new Ship('Battleship', 4)
const cruiser = new Ship('Cruiser', 3)
const submarine = new Ship('Submarine', 3)
const destroyer = new Ship('Destroyer', 2)

const fleet = [carrier, battleship, cruiser, submarine, destroyer]

const playerBoard = new Board('player-board', false)
const enemyBoard = new Board('enemy-board', true)

// Ship selection UI
const shipTypeSelect = document.getElementById('ship-type')
shipTypeSelect.addEventListener('change', () => {
  const type = shipTypeSelect.value
  playerBoard.currentShip = fleet.find((ship) => ship.name === type)
})

const rotateButton = document.getElementById('rotate-button')
rotateButton.addEventListener('click', () => {
  playerBoard.direction =
    playerBoard.direction === 'horizontal' ? 'vertical' : 'horizontal'
})

const fireButton = document.getElementById('fire-button')
fireButton.addEventListener('click', () => enemyBoard.fire())

// Optional: set default ship on load
playerBoard.currentShip = fleet[0]
