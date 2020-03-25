import { Game } from '../engine'
import { GameModel, PlayerModel } from '../models'
import { thinky } from '../util/thinky'

const r = thinky.r

var createGame = async (
	game: Game,
	ownerId: string,
	onGameCreationSuccess: Function,
	onGameCreationFailure: Function
) => {
	var gameObject = new GameModel({
		type: game.type,
		code: game.code,
		deck: game.deck.getCardsAsString(),
		pile: game.getPileStateString(),
		currentTurn: game.currentTurn,
		maxPlayers: game.maxPlayers,
		isTeam: game.ifTeamGame
	})

	await PlayerModel.get(ownerId).run().then((player) => {
		gameObject.owner = player
		gameObject.players = [ player ]
	}).error((err) => {
		console.log(err)
	})

	await gameObject.saveAll({owner: true, players: true}).then((result) => {
		onGameCreationSuccess(result)
	}).error((err) => {
		onGameCreationFailure(err)
	})

	// console.log(gameObject)
}

var addPlayerToGame = async (gameCode: string, playerId: string) => {
	let game = await GameModel.get(gameCode).getJoin({players: true}).run()
	let player = await PlayerModel.get(playerId).run()
	game.players.push(player)
	await game.saveAll({owner: true, players: true})
}

var getGameByCode = async (gameCode: string) => {
	let game = await GameModel.filter(r.row('code').eq(gameCode)).getJoin({players: true}).run()
	return game
}

export { createGame, addPlayerToGame, getGameByCode }
