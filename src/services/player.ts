import { Player } from '../engine'
import { PlayerModel } from '../models'

class DatabaseError extends Error {
	public code: number
	constructor(code: number, message: string) {
		super(message)
		this.code = code
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = DatabaseError.name
	}
}

var create = async (player: Player) => {
	var playerObject = new PlayerModel({
		name: player.name,
		position: player.position,
		hand: player.hand,
		score: player.score
	})

	try {
		var player = await playerObject.saveAll()
	} catch (err) {
		throw new DatabaseError(500, 'SAVE PLAYER: Unable to save player')
	}
	return player
}

var updateName = async (id: string, name: string) => {
	try {
		var player = await PlayerModel.get(id).run()
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player does not exist')
	}
	player.name = name
	player.save()
}

var updateScore = async (id: string, score: number) => {
	try {
		var player = await PlayerModel.get(id).run()
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player does not exist')
	}
	player.score = score
	player.save()
}

var updateHand = async (id: string, hand: string[]) => {
	try {
		var player = await PlayerModel.get(id).run()
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player does not exist')
	}
	player.hand = hand
	player.save()
}

var getById = async (id: string): Promise<Player> => {
	try {
		var p = await PlayerModel.get(id).getJoin({ game: true }).run()
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player does not exist')
	}
	return Player.fromModelObject(p)
}

var setPlayerUpdatesCallback = (callback) => {
	PlayerModel.changes().then((feed) => {
		feed.each((err, doc) => {
			callback(doc)
		})
	})
}

export {
	create,
	getById,
	updateName,
	updateHand,
	updateScore,
	setPlayerUpdatesCallback
}
