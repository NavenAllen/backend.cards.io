import express from 'express'
import * as LiteratureController from './controller'
import * as LiteratureValidator from './validator'
import * as Validator from '../../util/validator'
import { Game } from '../../engine'

let router = express.Router()
let io,
	litNsp,
	socketIDMap = {}

const baseUrl = '/literature'
router.post(baseUrl + '/create', async (req, res) => {
	let player = await LiteratureController.registerPlayer(req.body.pid, req.body.name, req.body.pos)
	let game = await LiteratureController.hostGame(player)
	setGameData(game)
	res.send({
		gameCode: game.code,
		playerId: player.id
	})
})

router.post(baseUrl + '/join', async (req, res) => {
	try {
		let game = await LiteratureController.getGame(req.body.code)

		let player = await LiteratureController.registerPlayer(req.body.pid, req.body.name, req.body.pos)
		await LiteratureController.joinGame(game, player)
		setGameData(game)
		res.send({
			playerId: player.id
		})
	} catch (err) {
		res.send({
			error: err.message
		})
	}
})

router.post(baseUrl + '/start', async (req, res) => {
	try {
		let game = await LiteratureController.getGame(req.body.code)
		let player = game.getPlayerById(req.body.pid)

		Validator.isOwner(game, player)
		LiteratureController.startGame(game)

		setGameData(game)
		res.send({
			playerId: player.id
		})
	} catch (err) {
		res.send({
			error: err.message
		})
	}
})

router.post(baseUrl + '/play/ask', async (req, res) => {
	try {
		let game = getGameData(req.body.gcode)
		let from = game.getPlayerById(req.body.fid)

		Validator.isMyTurn(game, from)
		LiteratureValidator.canAsk(from, req.body.card)
		let to = game.getPlayerByPosition(req.body.tpos)

		LiteratureController.askForCard(game, from, to, req.body.card)
		res.send({
			result: "Asked for card"
		})
	} catch (err) {
		res.send({
			error: err.message
		})
	}
})

router.post(baseUrl + '/play/transfer', async (req, res) => {
	try {
		let game = getGameData(req.body.gcode)
		let from = game.getPlayerById(req.body.pid)

		Validator.isMyTurn(game, from)
		let to = game.getPlayerByPosition(req.body.tpos)

		Validator.areSameTeam(from, to)
		LiteratureController.transferTurn(game, to)
		res.send({
			result: "Transfered turn"
		})
	} catch (err) {
		res.send({
			error: err.message
		})
	}
})

router.post(baseUrl + '/play/declare', async (req, res) => {
	try {
		let game = getGameData(req.body.gcode)
		let from = game.getPlayerById(req.body.pid)

		Validator.isMyTurn(game, from)
		LiteratureController.declareSet(game, from, req.body.declaration)
		res.send({
			result: "Declared set"
		})
	} catch (err) {
		res.send({
			error: err.message
		})
	}
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
