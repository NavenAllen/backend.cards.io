class DeckError extends Error {
	public code: number
	constructor(code: number, message: string) {
		super(message)
		this.code = code
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = DeckError.name
	}
}

export class Deck {
	private _cards: string[]

	constructor(
		excludeJokers = false,
		deckCount = 1,
		exclusions: string[] = []
	) {
		exclusions.filter((e) => {
			if (!e.match(/([2-9]|10|[JQKA])[SCDH]/)) {
				throw new DeckError(400, 'INIT: Invalid Card => ' + e)
			}
		})

		this._cards = []
		const numbers = [
			'A',
			'2',
			'3',
			'4',
			'5',
			'6',
			'7',
			'8',
			'9',
			'10',
			'J',
			'Q',
			'K'
		]
		const suites = ['C', 'D', 'S', 'H']

		while (deckCount > 0) {
			suites.forEach((suite) => {
				numbers.forEach((number) => {
					var currentCard = number + suite
					if (!exclusions.includes(number + suite)) {
						this._cards.push(currentCard)
					}
				})
			})

			if (!excludeJokers) {
				this._cards.push('JOKER', 'JOKER')
			}

			deckCount--
		}
	}

	get cards(): string[] {
		return this._cards
	}

	set cards(cards: string[]) {
		this._cards = cards
	}

	shuffle = (n = 5): void => {
		while (n > 0) {
			let currentIndex = this._cards.length
			let temporaryValue
			let randomIndex
			while (currentIndex !== 0) {
				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex)
				currentIndex -= 1

				// And swap it with the current element.
				temporaryValue = this._cards[currentIndex]
				this._cards[currentIndex] = this._cards[randomIndex]
				this._cards[randomIndex] = temporaryValue
			}
			n--
		}
	}

	deal = (playerCount, cardCount = 0): string[][] => {
		let enablePile = true
		if (cardCount === 0) {
			cardCount = Math.floor(this._cards.length / playerCount)
			enablePile = false
		} else if (cardCount * playerCount > this._cards.length) {
			throw new DeckError(400, 'DEAL: Not enough cards in deck')
		}

		this.shuffle()

		const result = []
		const excess = this._cards.length - playerCount * cardCount
		while (playerCount > 0) {
			const playerHand = this._cards.splice(0, cardCount)
			result.push(playerHand)
			playerCount--
		}

		if (!enablePile) {
			for (let index = 0; index < excess; index++) {
				result[index].push(this._cards.splice(0, 1)[0])
			}
		}

		return result
	}

	draw = (): string => {
		return this._cards.splice(0, 1)[0]
	}

	refresh = (discardPile: string[]): void => {
		this._cards = discardPile
		this.shuffle()
	}
}
