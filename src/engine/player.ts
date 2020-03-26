import { Card } from './index'
import { PlayerService } from '../services'

var PlayerError = (message): Error => {
	const error = new Error(message)
	error.message = 'PlayerError'
	return error
}
PlayerError.prototype = Object.create(Error.prototype)

export class Player {
	private _name: string
	private _position: number
	private _hand: Card[]
	private _score: number
	private _databaseObjectId: string

	constructor(playerName: string) {
		this._name = playerName
		this._hand = []
		this._position = -1
		this._score = 0
	}

	static async build(name: string) {
		var p = new Player(name)
		await PlayerService.create(p).then((player) => {
			p._databaseObjectId = player.id
		})
		return p
	}

	get id(): string {
		return this._databaseObjectId
	}

	get name(): string {
		return this._name
	}

	get position(): number {
		return this._position
	}

	get score(): number {
		return this._score
	}

	get hand(): Card[] {
		return this._hand
	}

	getHand = (): string[] => {
		return this._hand.map((c) => {
			return c.number + c.suite
		})
	}

	add = (card: Card): void => {
		this._hand.push(card)
		PlayerService.updateHand(this._databaseObjectId, this.getHand())
	};

	set position(position: number) {
		this._position = position
	}

	set score(score: number) {
		this._score = score
		PlayerService.updateScore(this._databaseObjectId, this._score)
	}

	set hand(hand: Card[]) {
		this._hand = hand
	}

	set id(objectId: string) {
		this._databaseObjectId = objectId
	}

	getIndexOf = (card): number => {
		for (let i = 0; i < this._hand.length; i++) {
			if (this._hand[i].string === card) {
				return i
			}
		}
		return -1
	}

	discard = (card: string): Card => {
		const index = this.getIndexOf(card)
		if (index === -1) {
			throw PlayerError('Does not have the requested card')
		} else {
			let discarded = this._hand.splice(index, index + 1)[0]
			PlayerService.updateHand(this._databaseObjectId, this.getHand())
			return discarded
		}
	}

	sort = (): void => {
		this._hand.sort((a, b) => {
			return a.value - b.value
		})
	}
}
