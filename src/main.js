import { Ship } from './shipLogic.js'
import { Board } from './boardLogic.js'
import "./components/ship-selector.js"

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

const fireButton = document.getElementById('fire-button')
fireButton.addEventListener('click', () => enemyBoard.fire())
