import { Game, Player } from '../engine'
import { GameModel, PlayerModel } from '../models'
import { thinky } from '../util/thinky'
import { cursorTo } from 'readline'

const r = thinky.r

class DatabaseError extends Error {
	constructor(message: string) {
		super(message)
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = DatabaseError.name
	}
}

var create = async (game: Game, owner: Player) => {
	var gameObject = new GameModel({
		type: game.type,
		code: game.code,
		deck: game.deck.cards,
		pile: game.pile,
		currentTurn: game.currentTurn,
		minPlayers: game.minPlayers,
		maxPlayers: game.maxPlayers,
		isTeam: game.ifTeamGame,
		isActive: game.ifActive
	})
	try {
		var player = await PlayerModel.get(owner.id).run()
	} catch (err) {
		throw new DatabaseError('GET OWNER: Player does not exist')
	}

	gameObject.owner = player
	gameObject.players = [player]

	try {
		var gameData = await gameObject.saveAll({ owner: true, players: true })
	} catch (err) {
		throw new DatabaseError('SAVE GAME: Unable to save game')
	}

	return gameData
}

var addPlayer = async (gameId: string, playerId: string) => {
	try {
		var game = await GameModel.get(gameId).getJoin({ players: true }).run()
		var player = await PlayerModel.get(playerId).run()
	} catch (err) {
		throw new DatabaseError('ADD PLAYER: Requested object does not exist')
	}
	game.players.push(player)
	game.saveAll({ owner: true, players: true })
}

var removePlayer = async (gameId: string, playerId: string) => {
	try {
		var game = await GameModel.get(gameId).getJoin({ players: true }).run()
		var index = game.players.indexOf(
			game.players.find((p) => {
				return p.id === playerId
			})
		)
	} catch (err) {
		throw new DatabaseError('REMOVE PLAYER: Requested game does not exist')
	}
	game.players.splice(index, 1)
	game.saveAll({ owner: true, players: true })
}

var updateState = async (id: string, isActive: boolean) => {
	try {
		var game = await GameModel.get(id).run()
	} catch (err) {
		throw new DatabaseError('UPDATE STATE: Game does not exist')
	}
	game.isActive = isActive
	game.save()
}

var updateDeck = async (id: string, deck: string[]) => {
	try {
		var game = await GameModel.get(id).run()
	} catch (err) {
		throw new DatabaseError('UPDATE DECK: Game does not exist')
	}
	game.deck = deck
	game.save()
}

var updateTurn = async (id: string, turn: number) => {
	try {
		var game = await GameModel.get(id).run()
	} catch (err) {
		throw new DatabaseError('UPDATE TURN: Game does not exist')
	}
	game.currentTurn = turn
	game.save()
}

var updatePile = async (id: string, pile: string[]) => {
	try {
		var game = await GameModel.get(id).run()
	} catch (err) {
		throw new DatabaseError('UPDATE PILE: Game does not exist')
	}
	game.pile = pile
	game.save()
}

var updateLogs = async (id: string, logs: string[]) => {
	try {
		var game = await GameModel.get(id).run()
	} catch (err) {
		throw new DatabaseError('UPDATE LOGS: Game does not exist')
	}
	game.logs = logs
	game.save()
}

var getByCode = async (gameCode: string) => {
	try {
		var g = await GameModel.filter(r.row('code').eq(gameCode))
			.getJoin({ players: true, owner: true })
			.run()
	} catch (err) {
		throw new DatabaseError('GET GAME: Game does not exist')
	}
	return Game.fromModelObject(g[0])
}

var setGameUpdatesCallback = (callback) => {
	GameModel.changes().then((feed) => {
		feed.each((err, doc) => {
			if (err) throw err
			callback(doc)
		})
	})
}

export {
	create,
	addPlayer,
	removePlayer,
	getByCode,
	updateState,
	updateDeck,
	updateTurn,
	updatePile,
	updateLogs,
	setGameUpdatesCallback
}
