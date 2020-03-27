import { Game, Player } from '../engine'
import { GameModel, PlayerModel } from '../models'
import { thinky } from '../util/thinky'

const r = thinky.r

var create = async (game: Game, owner: Player) => {
	var gameObject = new GameModel({
		type: game.type,
		code: game.code,
		deck: game.deck.cards,
		pile: game.pile,
		currentTurn: game.currentTurn,
		minPlayers: game.minPlayers,
		maxPlayers: game.maxPlayers,
		isTeam: game.ifTeamGame
	})
	var player = await PlayerModel.get(owner.id).run()

	gameObject.owner = player
	gameObject.players = [player]
	var gameData = await gameObject.saveAll({ owner: true, players: true })

	return gameData
}

var addPlayer = async (gameId: string, playerId: string) => {
	let game = await GameModel.get(gameId).getJoin({players: true}).run()
	let player = await PlayerModel.get(playerId).run()
	game.players.push(player)
	await game.saveAll({ owner: true, players: true })
}

var updateDeck = async (id: string, deck: string[]) => {
	let game = await PlayerModel.get(id).run()
	game.deck = deck
	game.save()
}

var updateTurn = async (id: string, turn: number) => {
	let game = await PlayerModel.get(id).run()
	game.currentTurn = turn
	game.save()
}

var updatePile = async (id: string, pile: string[]) => {
	let game = await PlayerModel.get(id).run()
	game.pile = pile
	game.save()
}

var updateLogs = async (id: string, logs: string[]) => {
	let game = await PlayerModel.get(id).run()
	game.logs = logs
	game.save()
}

var getByCode = async (gameCode: string) => {
	try {
		var g = await GameModel.filter(r.row('code').eq(gameCode)).getJoin({players: true, owner: true}).run()
	} catch (err) {
		throw new Error('Game does not exist')
	}
	return Game.fromModelObject(g[0])
}

export { create, addPlayer, getByCode, updateDeck, updateTurn, updatePile, updateLogs }
