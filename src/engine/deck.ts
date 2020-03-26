var DeckError = (message: string): Error => {
	const error = new Error(message)
	error.message = 'DeckError'
	return error
}
DeckError.prototype = Object.create(Error.prototype)

export class Card {
	private _number: string
	private _suite: string
	private _value: number
	private _dataObjectId: string

	constructor(number: string, suite: string) {
		this._number = number
		this._suite = suite

		this._value = parseInt(number)
		if (number === 'J') this._value = 11
		if (number === 'Q') this._value = 12
		if (number === 'K') this._value = 13
		if (number === 'A') this._value = 14

		switch (suite) {
			case 'C':
				this._value += 100
				break
			case 'D':
				this._value += 200
				break
			case 'S':
				this._value += 300
				break
			case 'H':
				this._value += 400
				break
			case 'JOKER':
				this._value = 500
		}
	}

	get number(): string {
		return this._number
	}

	get suite(): string {
		return this._suite
	}

	get string(): string {
		return this.number + this.suite
	}

	get value(): number {
		return this._value
	};

	static fromString = (c: string): Card => {
		let suite = c.slice(-1)
		let number = c.slice(0, -1)
		if (suite === 'R') {
			suite = 'JOKER'
			number = ''
		}
		return (new Card(suite, number))
	}

	static fromStringArray = (c: string[]): Card[] => {
		let cards = []
		c.forEach((e: string) => {
			cards.push(Card.fromString(e))
		})
		return cards
	}
}

export class Deck {
	private _cards: Card[]

	constructor(
		excludeJokers = false,
		deckCount = 1,
		exclusions: string[] = []
	) {
		exclusions.filter((e) => {
			if (!e.match(/([2-9]|10|[JQKA])[SCDH]/)) {
				throw DeckError('Invalid Card => ' + e)
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
					var currentCard = new Card(number, suite)
					if (!exclusions.includes(number + suite)) {
						this._cards.push(currentCard)
					}
				})
			})

			if (!excludeJokers) {
				this._cards.push(new Card('', 'JOKER'), new Card('', 'JOKER'))
			}

			deckCount--
		}
	}

	get cards(): string[] {
		return this._cards.map((c) => {
			return c.number + c.suite
		})
	}

	set cards(c: string[]) {
		this._cards = Card.fromStringArray(c)
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

	deal = (playerCount, cardCount = 0): Card[][] => {
		let enablePile = true
		if (cardCount === 0) {
			cardCount = Math.floor(this._cards.length / playerCount)
			enablePile = false
		} else if (cardCount * playerCount > this._cards.length) {
			throw DeckError('Not enough cards in deck')
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

	draw = (): Card => {
		return this._cards.splice(0, 1)[0]
	}

	refresh = (discardPile: string[]): void => {
		this._cards = Card.fromStringArray(discardPile)
		this.shuffle()
	}
}
