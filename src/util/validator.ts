import { Game, Player } from '../engine'

const isMyTurn = (game: Game, player: Player) => {
	if (game.currentTurn !== player.position) throw new Error('Not your turn')
}

const areSameTeam = (p1: Player, p2: Player) => {
	if (p1.position % 2 !== p2.position % 2)
		throw new Error('Not the same team')
}

const isOwner = (game: Game, player: Player) => {
	if (game.owner.id !== player.id)
		throw new Error("You aren't the owner of the game")
}

const isPositionAvailable = (game: Game, position: number) => {
	if (
		game.players.find((p) => {
			return p.position === position
		})
	)
		throw new Error('The position is already taken')
}

export { isMyTurn, areSameTeam, isOwner, isPositionAvailable }
