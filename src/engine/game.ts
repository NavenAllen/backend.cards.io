import { Deck, Player } from './index'
import { GameService } from '../services'

class GameError extends Error {
	public code: number
	constructor(code: number, message: string) {
		super(message)
		this.code = code
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = GameError.name
	}
}

export class Game {
	private _type: string
	private _code: string
	private _deck: Deck
	private _owner: Player
	private _minPlayers: number
	private _maxPlayers: number
	private _isTeamGame: boolean
	private _players: Player[]
	private _pile: string[]
	private _isActive: boolean
	private _currentTurn: number
	private _databaseObjectId: string
	private _logs: string[]
	private _decideStarter: Function
	private _isGameOver: Function
	private _processRound: Function

	constructor(
		type: string,
		deck: Deck,
		minPlayers: number,
		maxPlayers: number,
		isTeamGame: boolean
	) {
		this._type = type
		this._code = this.randomString(10)
		this._deck = deck
		this._minPlayers = minPlayers
		this._maxPlayers = maxPlayers
		this._isTeamGame = isTeamGame
		this._isActive = false
		this._players = []
		this._pile = []
		this._logs = []
	}

	static build = async (
		type: string,
		deck: Deck,
		minPlayers: number,
		maxPlayers: number,
		isTeamGame: boolean,
		owner: Player
	) => {
		var g = new Game(type, deck, minPlayers, maxPlayers, isTeamGame)
		await GameService.create(g, owner).then((game) => {
			g._databaseObjectId = game.id
			g._owner = owner
			g.addPlayer(owner)
		})
		return g
	}

	static fromModelObject = (obj: any) => {
		let d = new Deck()
		d.cards = obj.deck
		let g = new Game(
			obj.type,
			d,
			obj.minPlayers,
			obj.maxPlayers,
			obj.isTeam
		)
		g.id = obj.id
		g.code = obj.code
		g.ifActive = obj.isActive
		g.currentTurn = obj.currentTurn
		g.pile = obj.pile
		g.logs = obj.logs

		obj.players.forEach((p) => {
			g.players.push(Player.fromModelObject(p))
		})
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

	get ifActive(): boolean {
		return this._isActive
	}

	get players(): Player[] {
		return this._players
	}

	get pile(): string[] {
		return this._pile
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
	}

	get logs(): string[] {
		return this._logs
	}

	get isGameOver(): Function {
		return this._isGameOver
	}

	set currentTurn(pos: number) {
		this._currentTurn = pos
		GameService.updateTurn(this._databaseObjectId, this._currentTurn).catch(
			(err) => {
				throw err
			}
		)
	}

	set decideStarter(starter: Function) {
		this._decideStarter = starter.bind(this)
	}

	set isGameOver(gameOver: Function) {
		this._isGameOver = gameOver.bind(this)
	}

	set processRound(processor: Function) {
		this._processRound = processor.bind(this)
	}

	set id(objectId: string) {
		this._databaseObjectId = objectId
	}

	set ifActive(isActive: boolean) {
		this._isActive = isActive
	}

	set code(c: string) {
		this._code = c
	}

	set pile(cards: string[]) {
		this._pile = cards
	}

	set owner(owner: Player) {
		this._owner = owner
	}

	set logs(logs: string[]) {
		this._logs = logs
	}

	log = (entry: string) => {
		this._logs.push(entry)
		GameService.updateLogs(this._databaseObjectId, this._logs).catch(
			(err) => {
				throw err
			}
		)
	}

	removePlayer = async (player: Player) => {
		if (this._isActive) {
			throw new GameError(403, 'LEAVE: Game already started')
		} else if (this._owner.id === player.id) {
			throw new GameError(403, 'LEAVE: Owner cannot leave the game')
		} else {
			let index = this._players.indexOf(this.getPlayerById(player.id))
			this._players.splice(index, 1)
			GameService.removePlayer(this._databaseObjectId, player.id).catch(
				(err) => {
					throw err
				}
			)
		}
	}

	end = async () => {
		if (this._isTeamGame) {
			let aScore = 0,
				bScore = 0
			this._players.forEach((p) => {
				if (p.position % 2 == 0) aScore += p.score
				else bScore += p.score
			})
			let winner: string
			let mod = 0
			if (bScore > aScore) mod = 1
			this._players.forEach((p) => {
				if (p.position % 2 == mod) winner += p.name + '/'
			})
			this.log('WINNER:' + winner.slice(0, -1))
		} else {
			this._players.sort((a, b) => {
				return b.score - a.score
			})
			let winner = this._players[0]
			this.log('WINNER:' + winner.name)
		}
		this._isActive = false
		GameService.updateState(this._databaseObjectId, this._isActive).catch(
			(err) => {
				throw err
			}
		)
	}

	destroy = () => {
		GameService.destroy(this._databaseObjectId)
	}

	addPlayer = async (newPlayer: Player) => {
		if (this._isActive) {
			throw new GameError(403, 'JOIN: Game already started')
		} else if (this._players.length === this._maxPlayers) {
			throw new GameError(403, 'JOIN: Player limit reached')
		} else {
			this._players.push(newPlayer)
			GameService.addPlayer(this._databaseObjectId, newPlayer.id).catch(
				(err) => {
					throw err
				}
			)
		}
	}

	getSpots = (): Object[] => {
		let available = [...Array(this._maxPlayers).keys()].map((i) => i + 1)
		let result = this._players.map((p) => {
			available.splice(p.position - 1, 1)
			return {
				name: p.name,
				position: p.position
			}
		})
		available.map((n) => {
			result.push({
				name: '<Available>',
				position: n
			})
		})
		result.sort((a, b) => {
			return a.position - b.position
		})
		if (this._players.length < this._minPlayers)
			result.splice(this._minPlayers - this._maxPlayers)
		return result
	}

	getPlayerById = (id: string): Player => {
		return this._players.find((p: Player) => {
			return p.id === id
		})
	}

	getPlayerByPosition = (pos: number): Player => {
		return this._players.find((p: Player) => {
			return p.position === pos
		})
	}

	findCardWithPlayer = (card: string): number => {
		for (let i = 0; i < this.players.length; i++) {
			if (this.players[i].getIndexOf(card) !== -1) return i
		}
	}

	discardToPile = (card): void => {
		this._pile.push(card)
		GameService.updatePile(this._databaseObjectId, this.pile).catch(
			(err) => {
				throw err
			}
		)
	}

	prepareGame = (cardCount = 0): void => {
		if (this._isTeamGame && this._players.length % 2 !== 0)
			throw new GameError(403, 'START: Not enough players')

		if (this._players.length < this._minPlayers)
			throw new GameError(403, 'START: Not enough players')

		this._deck
			.deal(this._players.length, cardCount)
			.forEach((hand, index) => {
				this._players[index].hand = hand
				console.log(this._players[index].hand)
			})

		this._isActive = true
		GameService.updateState(this._databaseObjectId, this._isActive).catch(
			(err) => {
				throw err
			}
		)
		GameService.updateDeck(this._databaseObjectId, this._deck.cards).catch(
			(err) => {
				throw err
			}
		)
		this._decideStarter()
		GameService.updateTurn(this._databaseObjectId, this._currentTurn).catch(
			(err) => {
				throw err
			}
		)
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
