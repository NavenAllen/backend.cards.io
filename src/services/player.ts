import { Player } from '../engine'
import { PlayerModel } from '../models'
import { createDeflate } from 'zlib'

class DatabaseError extends Error {
	public code: number
	constructor(code: number, message: string) {
		super(message)
		this.code = code
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = DatabaseError.name
	}
}

var create = async (player: Player, createdAt: Date) => {
	var playerObject = new PlayerModel({
		name: player.name,
		position: player.position,
		hand: player.hand,
		score: player.score,
		createdAt: createdAt
	})

	try {
		var player = await playerObject.saveAll()
	} catch (err) {
		throw new DatabaseError(500, 'SAVE PLAYER: Unable to save player')
	}
	return player
}

var updateDetails = async (id: string, name: string, pos: number) => {
	try {
		var player = await PlayerModel.get(id).run()
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player does not exist')
	}
	player.name = name
	player.position = pos
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

var getObjectById = async (id: string) => {
	try {
		var p = await PlayerModel.get(id).run()
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player does not exist')
	}
	return p
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
			if (err) throw err
			callback(doc)
		})
	})
}

export {
	create,
	getObjectById,
	getById,
	updateDetails,
	updateHand,
	updateScore,
	setPlayerUpdatesCallback
}
