import { Game, Player } from '../engine'

class ValidationError extends Error {
	public code: number
	constructor(code: number, message: string) {
		super(message)
		this.code = code
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = ValidationError.name
	}
}

const isMyTurn = (game: Game, player: Player) => {
	if (game.currentTurn !== player.position)
		throw new ValidationError(403, 'INVALID: Not your turn')
}

const areSameTeam = (p1: Player, p2: Player) => {
	if (p1.position % 2 !== p2.position % 2)
		throw new ValidationError(403, 'INVALID: Not the same team')
}

const isOwner = (game: Game, player: Player) => {
	if (game.owner.id !== player.id)
		throw new ValidationError(
			401,
			"INVALID: You aren't the owner of the game"
		)
}

const isNotOwner = (game: Game, player: Player) => {
	if (game.owner.id === player.id)
		throw new ValidationError(401, 'INVALID: You are the owner of the game')
}

const isPositionAvailable = (game: Game, position: number) => {
	if (
		game.players.find((p) => {
			return p.position === position
		})
	)
		throw new ValidationError(400, 'INVALID: The position is already taken')
}

export { isMyTurn, areSameTeam, isOwner, isPositionAvailable, isNotOwner }
