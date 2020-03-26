import { Card } from './index'
import { PlayerService } from '../services'

var PlayerError = (message): Error => {
	const error = new Error(message)
	error.message = 'PlayerError'
	return error
}
PlayerError.prototype = Object.create(Error.prototype)

export class Player {
	private _name: string;
	private _position: number;
	private _hand: Card[];
	private _score: number;
	private _databaseObjectId: string;

	constructor (playerName: string) {
		this._name = playerName
		this._hand = []
		this._position = -1
		this._score = 0
	}

	static async build(name: string) {
		var p = new Player(name)
		await PlayerService.createPlayer(p, p.onPlayerCreationSuccess, p.onPlayerCreationFailure)
		return p
	}

	onPlayerCreationSuccess = (data): void => {
		this._databaseObjectId = data.id
	};

	onPlayerCreationFailure = (error): void => {
		throw PlayerError(error.msg)
	};

	get id(): string {
		return this._databaseObjectId;
	}

	get name(): string {
		return this._name
	};

	get position(): number {
		return this._position
	};

	get score(): number {
		return this._score;
	}

	get hand(): Card[] {
		return this._hand
	};

	getHandAsString = (): string[] => {
		return this._hand.map((c) => {
			return c.number + c.suite
		});
	};

	add = (card: Card): void => {
		this._hand.push(card)
	};

	set position(position: number) {
		this._position = position
	};

	set score(score: number) {
		this._score = score
	}

	set hand(hand: Card[]) {
		this._hand = hand
	};

	getIndexOf = (card: string): number => {
		for (let i = 0; i < this._hand.length; i++) {
			if (this._hand[i].string === card) {
				return i;
			}
		}
		return -1;
	};

	discard = (card: string): Card => {
		const index = this.getIndexOf(card)
		if (index === -1) {
			throw PlayerError('Does not have the requested card')
		} else {
			return this._hand.splice(index, index + 1)[0]
		}
	};

	sort = (): void => {
		this._hand.sort((a, b) => {
			return a.value - b.value
		});
	};
}
