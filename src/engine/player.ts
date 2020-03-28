import { Card } from './index'
import { PlayerService } from '../services'

class PlayerError extends Error {
	public code: number
	constructor(code: number, message: string) {
		super(message)
		this.code = code
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = PlayerError.name
	}
}

export class Player {
	private _name: string
	private _position: number
	private _hand: Card[]
	private _score: number
	private _databaseObjectId: string

	constructor(
		name: string,
		position: number,
		hand: Card[] = [],
		score: number = 0
	) {
		this._name = name
		this._hand = hand
		this._position = position
		this._score = score
	}

	static async build(name: string, pos: number) {
		var p = new Player(name, pos)
		await PlayerService.create(p).then((player) => {
			p._databaseObjectId = player.id
		})
		return p
	}

	static fromModelObject = (obj: any): Player => {
		let p = new Player(
			obj.name,
			obj.position,
			Card.fromStringArray(obj.hand),
			obj.score
		)
		p.id = obj.id
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
		PlayerService.updateHand(this._databaseObjectId, this.getHand()).catch(
			(err) => {
				throw err
			}
		)
	}

	set position(position: number) {
		this._position = position
	}

	set name(name: string) {
		this._name = name
		PlayerService.updateName(this._databaseObjectId, this._name).catch(
			(err) => {
				throw err
			}
		)
	}

	set score(score: number) {
		this._score = score
		PlayerService.updateScore(this._databaseObjectId, this._score).catch(
			(err) => {
				throw err
			}
		)
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
			throw new PlayerError(
				403,
				'DISCARD: Does not have the requested card'
			)
		} else {
			let discarded = this._hand.splice(index, 1)[0]
			PlayerService.updateHand(
				this._databaseObjectId,
				this.getHand()
			).catch((err) => {
				throw err
			})
			return discarded
		}
	}

	sort = (): void => {
		this._hand.sort((a, b) => {
			return a.value - b.value
		})
	}
}
