import { Game, Player } from '../engine'
import { GameModel, PlayerModel } from '../models'
import { thinky } from '../util/thinky'

const r = thinky.r

var createGame = async (game: Game, owner: Player) => {
	var gameObject = new GameModel({
		type: game.type,
		code: game.code,
		deck: game.deck.getCardsAsString(),
		pile: game.getPileAsString(),
		currentTurn: game.currentTurn,
		maxPlayers: game.maxPlayers,
		isTeam: game.ifTeamGame
	})
	var player = await PlayerModel.get(owner.databaseObjectId).run()

	gameObject.owner = player
	gameObject.players = [player]
	var gameData = await gameObject.saveAll({ owner: true, players: true })

	return gameData
}

var addPlayerToGame = async (gameId: string, playerId: string) => {
	var game = await GameModel.get(gameId).getJoin({ players: true }).run()
	var player = await PlayerModel.get(playerId).run()

	game.players.push(player)
	await game.saveAll({ owner: true, players: true })
}

var getGameByCode = (gameCode: string) => {
	return GameModel.filter(r.row('code').eq(gameCode))
		.getJoin({ players: true })
		.run()
}

export { createGame, addPlayerToGame, getGameByCode }
