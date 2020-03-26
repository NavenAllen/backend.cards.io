import { Card, Deck, Player } from './index'
import { GameService } from '../services'

var GameError = (message): Error => {
	const error = new Error(message)
	error.message = message
	return error
}
GameError.prototype = Object.create(Error.prototype)

export class Game {
	private _type: string
	private _code: string
	private _deck: Deck
	private _maxPlayers: number
	private _isTeamGame: boolean
	private _players: Player[]
	private _pile: Card[]
	private _currentTurn: number
	private _databaseObjectId: string
	processRound: Function
	decideStarter: (player: Player) => boolean
	decideTurn: Function

	constructor(
		type: string,
		deck: Deck,
		maxPlayers: number,
		isTeamGame: boolean,
		players: string[] = []
	) {
		this._type = type
		this._code = this.randomString(10)
		this._deck = deck
		this._maxPlayers = maxPlayers
		this._isTeamGame = isTeamGame
		this._players = []
		this._pile = []
		// this.currentRound = [];
	}

	static async build(
		type: string,
		deck: Deck,
		maxPlayers: number,
		isTeamGame: boolean,
		owner: Player
	) {
		var g = new Game(type, deck, maxPlayers, isTeamGame)
		await GameService.createGame(g, owner)
			.then((game) => {
				g.databaseObjectId = game.id
				g.addPlayer(owner)
			})
			.catch((error) => {
				throw GameError(error.message)
			})
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

	get pile(): Card[] {
		return this._pile
	}

	getPileAsString = (): String[] => {
		return this._pile.map((c) => {
			return c.number + c.suite
		})
	}

	get currentTurn(): number {
		return this._currentTurn
	}

	get maxPlayers(): number {
		return this._maxPlayers
	}

	set currentTurn(pos: number) {
		this.currentTurn = pos
	}

	set databaseObjectId(objectId: string) {
		this._databaseObjectId = objectId
	}

	addPlayer = async (newPlayer: Player) => {
		if (this._players.length === this._maxPlayers) {
			throw GameError('Player limit reached')
		} else {
			this._players.push(newPlayer)
			await GameService.addPlayerToGame(
				this._databaseObjectId,
				newPlayer.databaseObjectId
			)
		}
	}

	findCardWithPlayer = (card: string): number => {
		for (let i = 0; i < this.players.length; i++) {
			if (this.players[i].getIndexOf(card) !== -1) return i
		}
	}
	discardToPile = (card): void => {
		this._pile.push(card)
	}

	setRoundProcessor = (processor): void => {
		// processor should clear pile after every round
		this.processRound = processor.bind(this)
	}

	setStartingDecision = (decision): void => {
		if (decision === undefined) {
			const env = {
				random: Math.floor((Math.random() * 10) % this._players.length)
			}
			this.decideStarter = function (player) {
				return player.position === this.random
			}
			this.decideStarter = this.decideStarter.bind(env)
		} else {
			this.decideStarter = decision.bind(this)
		}
	}

	makeStartingDecision = (): void => {
		for (let i = 0; i < this._players.length; i++) {
			if (this.decideStarter(this._players[i])) {
				this._currentTurn = i
				break
			}
		}
	}

	setTurnDecision = (decision): void => {
		this.decideTurn = decision.bind(this)
	}

	prepareGame = (cardCount = 0): void => {
		if (this._isTeamGame && this._players.length % 2 !== 0) {
			throw GameError('Not enough players')
		}

		this._deck
			.deal(this._players.length, cardCount)
			.forEach((hand, index) => {
				this._players[index].hand = hand
				console.log(this._players[index].getHandAsString())
			})
	}

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
