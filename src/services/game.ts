import { Game, Player } from '../engine'
import { GameModel, PlayerModel } from '../models'

class DatabaseError extends Error {
	public code: number
	constructor(code: number, message: string) {
		super(message)
		this.code = code
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = DatabaseError.name
	}
}

var create = async (game: Game, owner: Player, createdAt: Date) => {
	var gameObject = new GameModel({
		type: game.type,
		code: game.code,
		deck: game.deck.cards,
		pile: game.pile,
		currentTurn: game.currentTurn,
		minPlayers: game.minPlayers,
		maxPlayers: game.maxPlayers,
		logs: game.logs,
		isTeam: game.ifTeamGame,
		isActive: game.ifActive,
		createdAt: createdAt
	})
	try {
		var ownerDocument = await PlayerModel.findById(owner.id)
		if (!ownerDocument)
			throw new DatabaseError(500, 'GET OWNER: Player does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'GET OWNER: Unable to get Player')
	}

	gameObject.owner = ownerDocument

	try {
		var gameData = await gameObject.save()
		if (!gameData)
			throw new DatabaseError(500, 'SAVE GAME: Unable to save game')
	} catch (err) {
		throw new DatabaseError(500, 'SAVE GAME: Unable to save game')
	}

	return gameData
}

var addPlayer = async (gameId: string, playerId: string) => {
	try {
		var game = await GameModel.findById(gameId)
		var player = await PlayerModel.findById(playerId)
		if (!game || !player)
			throw new DatabaseError(
				500,
				'ADD PLAYER: Requested object does not exist'
			)
	} catch (err) {
		throw new DatabaseError(
			500,
			'ADD PLAYER: Unable to get requested object'
		)
	}
	player.game = game
	player.save()
}

var removePlayer = async (playerId: string) => {
	try {
		var player = await PlayerModel.findByIdAndUpdate(
			playerId,
			{
				$unset: { game: 1 }
			},
			{ new: true }
		)
		if (!player)
			throw new DatabaseError(
				500,
				'REMOVE PLAYER: Requested player does not exist'
			)
	} catch (err) {
		throw new DatabaseError(500, 'REMOVE PLAYER: Unable to update game')
	}
}

var startGame = async (
	id: string,
	isActive: boolean,
	deck: string[],
	currentTurn: number
) => {
	try {
		var game = await GameModel.findByIdAndUpdate(
			id,
			{
				deck,
				isActive,
				currentTurn
			},
			{ new: true }
		)
		if (!game)
			throw new DatabaseError(500, 'START GAME: Game does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'START GAME: Unable to update Game')
	}
}

var updateState = async (id: string, isActive: boolean) => {
	try {
		var game = await GameModel.findByIdAndUpdate(
			id,
			{
				isActive
			},
			{ new: true }
		)

		if (!game) throw new DatabaseError(500, 'UPDATE: Game does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Game could not be updated')
	}
}

var updateTurn = async (id: string, currentTurn: number) => {
	try {
		var game = await GameModel.findByIdAndUpdate(
			id,
			{
				currentTurn
			},
			{ new: true }
		)

		if (!game) throw new DatabaseError(500, 'UPDATE: Game does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Game could not be updated')
	}
}

var updatePile = async (id: string, pile: string[]) => {
	try {
		var game = await GameModel.findByIdAndUpdate(
			id,
			{
				pile
			},
			{ new: true }
		)

		if (!game) throw new DatabaseError(500, 'UPDATE: Game does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Game could not be updated')
	}
}

var updateLogs = async (id: string, logs: string[]) => {
	try {
		var game = await GameModel.findByIdAndUpdate(
			id,
			{
				logs
			},
			{ new: true }
		)

		if (!game) throw new DatabaseError(500, 'UPDATE: Game does not exist')
	} catch (err) {
		throw new DatabaseError(500, 'UPDATE: Game could not be updated')
	}
}

var getById = async (id: string) => {
	try {
		var g = await GameModel.findById(id, { _id: false }).populate(
			'players',
			'-_id name position score hand'
		)
		g = g.toObject()
		g.id = id
		if (!g) throw new DatabaseError(500, 'GET GAME: Game does not exist')
		g.players.forEach((element) => {
			element.count = element.hand.length
			delete element['hand']
		})
	} catch (err) {
		throw new DatabaseError(500, 'GET GAME: Could not get Game')
	}
	return g
}

var pluckById = async (id: string) => {
	try {
		var g = await GameModel.findById(id, { _id: false })
			.select({
				code: 1,
				pile: 1,
				currentTurn: 1,
				logs: 1
			})
			.populate('players', '-_id name position score hand')
		g = g.toObject()
		g.id = id
		if (!g) throw new DatabaseError(500, 'GET GAME: Game does not exist')
		g.players.forEach((element) => {
			element.count = element.hand.length
			delete element['hand']
		})
	} catch (err) {
		throw new DatabaseError(500, 'GET GAME: Could not get Game')
	}
	return g
}

var destroy = async (id: string) => {
	try {
		var g = await GameModel.findByIdAndDelete(id)
	} catch (err) {
		throw new DatabaseError(500, 'DESTROY GAME: Unable to delete')
	}
}

export {
	create,
	addPlayer,
	removePlayer,
	getById,
	startGame,
	updateState,
	updateTurn,
	updatePile,
	updateLogs,
	destroy,
	pluckById
}
