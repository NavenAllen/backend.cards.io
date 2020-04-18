import { Game, Player } from '../engine'

class ValidationError extends Error {
	public code: number
	public scope: string
	constructor(code: number, scope: string, message: string) {
		super(message)
		this.code = code
		this.scope = scope
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = ValidationError.name
	}
}

const isValidName = (name) => {
	var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/

	if (format.test(name))
		throw new ValidationError(
			400,
			'VALIDATOR',
			'Name should not have any special characters'
		)
}

const isMyTurn = (game: Game, player: Player) => {
	if (game.currentTurn !== player.position)
		throw new ValidationError(403, 'VALIDATOR', 'Not your turn')
}

const areSameTeam = (p1: Player, p2: Player) => {
	if (p1.position % 2 !== p2.position % 2)
		throw new ValidationError(403, 'VALIDATOR', 'Not the same team')
}

const isOwner = (game: Game, player: Player) => {
	if (game.owner.id !== player.id)
		throw new ValidationError(
			401,
			'VALIDATOR',
			"You aren't the owner of the game"
		)
}

const isNotOwner = (game: Game, player: Player) => {
	if (game.owner.id === player.id)
		throw new ValidationError(
			401,
			'VALIDATOR',
			'You are the owner of the game'
		)
}

const isPositionAvailable = (game: Game, position: number) => {
	if (
		game.players.find((p) => {
			return p.position === position
		})
	)
		throw new ValidationError(
			400,
			'VALIDATOR',
			'The position is already taken'
		)
}

export {
	isValidName,
	isMyTurn,
	areSameTeam,
	isOwner,
	isPositionAvailable,
	isNotOwner
}
