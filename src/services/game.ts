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

var addPlayerToGame = (gameCode: string, playerId: string) => {
	return GameModel.get(gameCode).getJoin({players: true}).run().then( game => {
		PlayerModel.get(playerId).run().then( player => {
			game.players.push(player)
			game.saveAll({owner: true, players: true})
		})
	})
}

var getGameByCode = (gameCode: string) => {
	return GameModel.filter(r.row('code').eq(gameCode)).getJoin({players: true}).run();
}

export { createGame, addPlayerToGame, getGameByCode }
