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

var create = async (player: Player, createdAt: Date) => {
	var playerObject = new PlayerModel({
		name: player.name,
		position: player.position,
		hand: player.hand,
		score: player.score,
		createdAt: createdAt
	})

	try {
		var p = await playerObject.save()
	} catch (err) {
		throw new DatabaseError(500, 'SAVE PLAYER: Unable to save player')
	}
	return p
}

var updateDetails = async (id: string, name: string, pos: number) => {
	try {
		var player = await PlayerModel.findByIdAndUpdate(
			id,
			{
				name: name,
				position: pos
			},
			{ new: true }
		)

		if (!player)
			throw new DatabaseError(500, 'UPDATE: Player does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player could not be updated')
	}
}

var updateScore = async (id: string, score: number) => {
	try {
		var player = await PlayerModel.findByIdAndUpdate(
			id,
			{
				score
			},
			{ new: true }
		)

		if (!player)
			throw new DatabaseError(500, 'UPDATE: Player does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player could not be updated')
	}
}

var updateHand = async (id: string, hand: string[]) => {
	try {
		var player = await PlayerModel.findByIdAndUpdate(
			id,
			{
				hand
			},
			{ new: true }
		)

		if (!player)
			throw new DatabaseError(500, 'UPDATE: Player does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player could not be updated')
	}
}

var getObjectById = async (id: string): Promise<Player> => {
	try {
		var p = await PlayerModel.findById(id)
		if (!p) throw new DatabaseError(500, 'UPDATE: Player does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player does not exist')
	}
	return Player.fromModelObject(p)
}

var getDocumentById = async (id: string) => {
	try {
		var p = await PlayerModel.get(id).getJoin({ game: true }).run()
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Player does not exist')
	}
	return p
}

var pluckById = async (id: string) => {
	try {
		var p = await PlayerModel.findById(id, { _id: false }).select({
			name: 1,
			position: 1,
			score: 1,
			hand: 1
		})
		p = p.toObject()
		p.id = id
		if (!p) throw new DatabaseError(500, 'GET GAME: Game does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'GET GAME: Could not get Game')
	}
	return p
}

export {
	create,
	getObjectById,
	getDocumentById,
	updateDetails,
	updateHand,
	updateScore,
	pluckById
}
