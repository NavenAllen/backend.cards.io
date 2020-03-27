import express from 'express'
import * as LiteratureController from './controller'
import * as LiteratureValidator from './validator'
import * as Validator from '../../util/validator'
import { Game } from '../../engine'

let router = express.Router()
let io,
	litNsp,
	gameData = {},
	socketIDMap = {}

const baseUrl = '/literature'
router.post(baseUrl + '/create', async (req, res) => {
	let player = await LiteratureController.registerPlayer(req.body.pid, req.body.name, req.body.pos)
	let game = await LiteratureController.hostGame(player)
	setGameData(game.code, game)
	res.send({
		gameCode: game.code,
		playerId: player.id
	})
})

router.post(baseUrl + '/join', async (req, res) => {
	try {
		let game = getGameData(req.body.gameCode)
		let player = await LiteratureController.registerPlayer(req.body.pid, req.body.name, req.body.pos)
		
		await LiteratureController.joinGame(game, player)
		setGameData(game.code, game)
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

		setGameData(game.code, game)
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

var setupLiteratureGame = (ioObject, litNspObject) => {
	io = ioObject
	litNsp = litNspObject
	openSocketChannels()
}

var getGameData = (gameCode: string): Game => {
	return gameData[gameCode]
}

var setGameData = (gameCode: string, game: Game) => {
	gameData[gameCode] = game
}

var openSocketChannels = (): void => {
	litNsp.on('connection', (socket) => {
		socket.on('connectGame', (data) => {
			var playerId = data.playerId
			var gameCode = data.gameCode
			var player = getGameData(gameCode).getPlayerById(playerId)

			socket.join(gameCode)
			socketIDMap[socket.id] = playerId
			litNsp
				.to(gameCode)
				.emit('gameUpdates', player.name + ' has joined the game')
		})

		socket.on('ask', (data) => {
			//LiteratureController.askForCard(getGameData(data.gameCode), data.fromPlayerId, data.toPlayerId)
		})
	})
}

export { router as LiteratureRouter, setupLiteratureGame }
