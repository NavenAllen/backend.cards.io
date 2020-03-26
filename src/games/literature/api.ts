import express from 'express'
import * as LiteratureController from './controller'
import { Game, Player } from '../../engine'

let router = express.Router()
let io,
	litNsp,
	socketIDMap = {}

const baseUrl = '/literature'
router.post(baseUrl + '/create', async (req, res) => {
	var game = await startLiteratureGame(req.body.name)
	res.send({
		gameId: game.id,
		playerId: game.owner.id
	})
})

var setupLiteratureGame = (io, litNspObject) => {
	litNsp = litNspObject
	console.log('hello')
}

var startLiteratureGame = async (hostName) => {
	var game = await LiteratureController.hostGame('lit', hostName)
	setGameData(game.code, game)
	return game
}

var getGameData = (gameCode: string): Game => {
	return io.sockets.adapter.rooms[gameCode].game
}

var setGameData = (gameCode: string, game: Game) => {
	io.sockets.adapter.rooms[gameCode].game = game
}

var updateGameData = (game: Game) => {
	setGameData(game.code, game)
}

var openSocketChannels = (gameId: string): void => {
	litNsp.on('connection', (socket) => {
		socket.on('connect', (id, data) => {
			socket.join(data.gameId)
			socketIDMap[data.playerId] = id
			io.to(gameId).emit(data.playerName + 'has joined the game')
		})

		socket.on('ask', (data) => {
			//LiteratureController.askForCard(getGameData(data.gameCode), data.fromPlayerId, data.toPlayerId)
		})
	})
}

export { router as LiteratureRouter, setupLiteratureGame }
