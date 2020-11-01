import { Player, Game } from '../../engine'

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

const isValidMove = (game: Game, player: Player, card: string) => {
	let currentSuit = game.getAdditionalData('currentSuit')
	if (!player.hand.includes(card)) {
		throw new ValidationError(
			400,
			'ACE-VALIDATOR',
			'You dont have the card'
		)
	}
	if (card.slice(-1) !== currentSuit) {
		let cardCount = 0
		player.hand.forEach((card) => {
			if (card.slice(-1) === currentSuit) cardCount++
		})
		if (cardCount > 0) {
			throw new ValidationError(
				400,
				'ACE-VALIDATOR',
				'You have a card from the current Suit'
			)
		}
	}
}

export { isValidMove }
