import express from 'express'
import * as LiteratureController from './controller'
import { Game, Player } from '../../engine'
import { PlayerService, GameService } from '../../services'

let router = express.Router()
let io,
	litNsp,
	socketIDMap = {}

const baseUrl = '/literature'
router.post(baseUrl + '/create', async (req, res) => {
	let player: Player
	if (req.body.pid === null) {
		player = await Player.build(req.body.name)
	} else {
		player = await PlayerService.getById(req.body.pid)
		player.name = req.body.name
	}
	var game = await LiteratureController.hostGame(player)
	setGameData(game)
	res.send({
		gameCode: game.code,
		playerId: player.id
	})
})

router.post(baseUrl + '/join', async (req, res) => {
	let player: Player
	if (req.body.pid === null) {
		player = await Player.build(req.body.name)
	} else {
		player = await PlayerService.getById(req.body.pid)
		player.name = req.body.name
	}

	var game = await GameService.getByCode(req.body.gcode)
	await LiteratureController.joinGame(game, player)
	setGameData(game)
	res.send({
		playerId: player.id
	})
})

router.post(baseUrl + '/play/ask', async (req, res) => {
	// Validators go here

	var game = getGameData(req.body.gcode)
	var from = game.getPlayerById(req.body.fid)
	var to = game.getPlayerById(req.body.tid)

	LiteratureController.askForCard(game, from, to, req.body.card)
	res.send({
		result: "Asked for card"
	})
})

router.post(baseUrl + '/play/transfer', async (req, res) => {
	// Validators go here

	var game = getGameData(req.body.gcode)
	var to = game.getPlayerById(req.body.tid)

	LiteratureController.transferTurn(game, to)
	res.send({
		result: "Transfered turn"
	})
})

router.post(baseUrl + '/play/declare', async (req, res) => {
	var game = getGameData(req.body.gcode)
	var from = game.getPlayerById(req.body.pid)

	LiteratureController.declareSet(game, from, req.body.declaration)
	res.send({
		result: "Declared set"
	})
})

var setupLiteratureGame = (io, litNspObject) => {
	litNsp = litNspObject
	console.log('hello')
}

var getGameData = (gameCode: string): Game => {
	return io.sockets.adapter.rooms[gameCode].game
}

var setGameData = (game: Game) => {
	io.sockets.adapter.rooms[game.code].game = game
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
