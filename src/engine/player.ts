import { PlayerService } from '../services'

class PlayerError extends Error {
	public code: number
	public scope: string
	constructor(code: number, scope: string, message: string) {
		super(message)
		this.code = code
		this.scope = scope
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = PlayerError.name
	}
}

export class Player {
	private _name: string
	private _position: number
	private _hand: string[]
	private _score: number
	private _databaseObjectId: string

	constructor(
		name: string,
		position: number,
		hand: string[] = [],
		score: number = 0
	) {
		this._name = name
		this._hand = hand
		this._position = position
		this._score = score
	}

	static async build(name: string, pos: number) {
		var p = new Player(name, pos)
		await PlayerService.create(p, new Date()).then((player) => {
			p._databaseObjectId = player._id.toString()
		})
		return p
	}

	static fromModelObject = (obj: any): Player => {
		let p = new Player(obj.name, obj.position, obj.hand, obj.score)
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

	get hand(): string[] {
		return this._hand
	}

	set position(position: number) {
		this._position = position
		PlayerService.updatePosition(
			this._databaseObjectId,
			this._position
		).catch((err) => {
			throw err
		})
	}

	set name(name: string) {
		this._name = name
	}

	set score(score: number) {
		this._score = score
		PlayerService.updateScore(this._databaseObjectId, this._score).catch(
			(err) => {
				throw err
			}
		)
	}

	set hand(hand: string[]) {
		this._hand = hand
		PlayerService.updateHand(this._databaseObjectId, this._hand).catch(
			(err) => {
				throw err
			}
		)
	}

	set id(objectId: string) {
		this._databaseObjectId = objectId
	}

	updateDetails = (name: string, pos: number) => {
		this._name = name
		this._position = pos
		this._score = 0
		PlayerService.updateDetails(
			this._databaseObjectId,
			this._name,
			this._position,
			this._score
		).catch((err) => {
			throw err
		})
	}

	getIndexOf = (card: string): number => {
		for (let i = 0; i < this._hand.length; i++) {
			if (this._hand[i] === card) {
				return i
			}
		}
		return -1
	}

	add = async (card: string): Promise<void> => {
		this._hand.push(card)
		await PlayerService.updateHand(this._databaseObjectId, this._hand)
	}

	discard = async (card: string): Promise<string> => {
		const index = this.getIndexOf(card)
		if (index === -1) {
			throw new PlayerError(
				403,
				'DISCARD-CARD',
				'Player does not have the requested card'
			)
		} else {
			let discarded = this._hand.splice(index, 1)[0]
			await PlayerService.updateHand(this._databaseObjectId, this._hand)
			return discarded
		}
	}
}
