import { Card, Deck, Player } from './index'
import { GameService } from '../services'

var GameError = (message): Error => {
	const error = new Error(message)
	error.message = message
	return error
}
GameError.prototype = Object.create(Error.prototype)

export class Game {
	private _type: string;
	private _code: string;
	private _deck: Deck;
	private _owner: Player;
	private _minPlayers: number;
	private _maxPlayers: number;
	private _isTeamGame: boolean;
	private _players: Player[];
	private _pile: Card[];
	private _currentTurn: number;
	private _databaseObjectId: string;

	constructor (type: string, deck: Deck, minPlayers: number, maxPlayers: number, isTeamGame: boolean) {
		this._type = type
		this._code = this.randomString(10)
		this._deck = deck
		this._minPlayers = minPlayers
		this._maxPlayers = maxPlayers
		this._isTeamGame = isTeamGame
		this._players = []
		this._pile = []
	}

	static build = async (type: string, deck: Deck, minPlayers: number, maxPlayers: number, isTeamGame: boolean, owner: Player) => {
		var g = new Game(type, deck, minPlayers, maxPlayers, isTeamGame)
		await GameService.create(g, owner).then((game) => {
			g._databaseObjectId = game.id
			g._owner = owner
			g.addPlayer(owner)
		}).catch((error) => {
			throw GameError(error.message)
		})
		return g
	}

	static fromModelObject = (obj: any) => {
		let d = new Deck()
		d.cards = obj.deck
		let g = new Game(obj.type, d, obj.minPlayers, obj.maxPlayers, obj.isTeam)
		g.id = obj.id
		g.code = obj.code
		g.currentTurn = obj.currentTurn
		g.pile = obj.pile

		obj.players.forEach(p => {
			g.players.push(Player.fromModelObject(p))
		});
		g.owner = Player.fromModelObject(obj.owner)
		return g
	}

	get id(): string {
		return this._databaseObjectId
	}

	get type(): string {
		return this._type
	}

	get code(): string {
		return this._code
	}

	get deck(): Deck {
		return this._deck
	}

	get ifTeamGame(): boolean {
		return this._isTeamGame
	}

	get players(): Player[] {
		return this._players
	}

	get pile(): string[] {
		return this._pile.map((c) => {
			return c.number + c.suite
		})
	}

	get currentTurn(): number {
		return this._currentTurn
	}

	get owner(): Player {
		return this._owner
	}

	get maxPlayers(): number {
		return this._maxPlayers
	}

	get minPlayers(): number {
		return this._minPlayers
	};

	set currentTurn(pos: number) {
		this._currentTurn = pos
		GameService.updateTurn(this._databaseObjectId, this._currentTurn)
	}

	set id(objectId: string) {
		this._databaseObjectId = objectId
	}

	set code(c: string) {
		this._code = c
	}

	set pile(cards: string[]) {
		this._pile = Card.fromStringArray(cards)
	}

	set owner(owner: Player) {
		this._owner = owner
	}

	addPlayer = async (newPlayer: Player) => {
		if (this._players.length === this._maxPlayers) {
			throw GameError('Player limit reached')
		} else {
			this._players.push(newPlayer)
			await GameService.addPlayer(this._databaseObjectId, newPlayer.id)
		}
	}

	getPlayerById = (id: string): Player => {
		return this._players.filter((p: Player) => {
			return p.id === id
		})[0]
	}

	findCardWithPlayer = (card: string): number => {
		for (let i = 0; i < this.players.length; i++) {
			if (this.players[i].getIndexOf(card) !== -1) return i
		}
	}

	discardToPile = (card): void => {
		this._pile.push(card)
		GameService.updatePile(this._databaseObjectId, this.pile)
	};

	prepareGame = (cardCount = 0): void => {
		if (this._isTeamGame && this._players.length % 2 !== 0)
			throw GameError('Not enough players')

		if (this._players.length < this._minPlayers)
			throw GameError('Not enough players')

		this._deck
			.deal(this._players.length, cardCount)
			.forEach((hand, index) => {
				this._players[index].hand = hand
				console.log(this._players[index].getHand())
			})

		GameService.updateDeck(this._databaseObjectId, this._deck.cards)
	};

	randomString = (len): string => {
		var charSet =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		var randomString = ''
		for (var i = 0; i < len; i++) {
			var randomPoz = Math.floor(Math.random() * charSet.length)
			randomString += charSet.substring(randomPoz, randomPoz + 1)
		}
		return randomString
	}
}
