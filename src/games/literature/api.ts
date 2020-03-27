import express from 'express'
import * as LiteratureController from './controller'
import * as LiteratureValidator from './validator'
import * as Validator from '../../util/validator'
import { Game } from '../../engine'

let router = express.Router()
let litNsp,
	gameData = {},
	socketIDMap = {}

const baseUrl = '/literature'
router.post(baseUrl + '/create', async (req, res) => {
	let player = await LiteratureController.registerPlayer(
		req.body.pid,
		req.body.name,
		req.body.pos
	)
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
		let player = await LiteratureController.registerPlayer(
			req.body.pid,
			req.body.name,
			req.body.pos
		)

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

var setupLiteratureGame = (ioObject, litNspObject) => {
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
		socket.on('connect-game', (data) => {
			var playerId = data.playerId
			var gameCode = data.gameCode
			var player = getGameData(gameCode).getPlayerById(playerId)

			socket.join(gameCode)
			socketIDMap[socket.id] = playerId
			litNsp
				.to(gameCode)
				.emit('gameUpdates', player.name + ' has joined the game')
		})

		socket.on('start-game', (data) => {
			let gameCode = data.gameCode
			let playerId = data.playerId

			try {
				let game = getGameData(gameCode)
				let player = game.getPlayerById(playerId)

				Validator.isOwner(game, player)
				LiteratureController.startGame(game)

				setGameData(game.code, game)
				litNsp.to(gameCode).emit('gameUpdates', 'Started game')
			} catch (err) {
				litNsp.to(gameCode).emit('gameUpdates', err.message)
			}
		})

		socket.on('play-ask', (data) => {
			let card = data.card
			let gameCode = data.gameCode

			try {
				let game = getGameData(gameCode)
				let fromPlayer = game.getPlayerByPosition(data.fromId)
				let toPlayer = game.getPlayerByPosition(data.toPos)

				Validator.isMyTurn(game, fromPlayer)
				LiteratureValidator.canAsk(fromPlayer, card)
				LiteratureController.askForCard(
					game,
					fromPlayer,
					toPlayer,
					card
				)
				litNsp
					.to(gameCode)
					.emit(
						'play-ask',
						fromPlayer.name +
							' has asked ' +
							toPlayer.name +
							' for the card ' +
							card
					)
			} catch (err) {
				litNsp.to(gameCode).emit('play-ask', err.message)
			}
		})

		socket.on('play-declare', (data) => {
			let gameCode = data.gameCode
			let playerId = data.playerId
			let declaration = data.declaration

			try {
				let game = getGameData(gameCode)
				let from = game.getPlayerById(playerId)

				Validator.isMyTurn(game, from)
				LiteratureController.declareSet(game, from, declaration)
				litNsp
					.to(gameCode)
					.emit('play-declare', 'Declared set successfully')
			} catch (err) {
				litNsp.to(gameCode).emit('play-declare', err.message)
			}
		})

		socket.on('play-transfer', (data) => {
			let gameCode = data.gameCode
			let fromId = data.fromId
			let toPos = data.toPos

			try {
				let game = getGameData(gameCode)
				let from = game.getPlayerById(fromId)

				Validator.isMyTurn(game, from)
				let to = game.getPlayerByPosition(toPos)

				Validator.areSameTeam(from, to)
				LiteratureController.transferTurn(game, to)
				litNsp.to(gameCode).emit('play-transfer', 'Transferred turn')
			} catch (err) {
				litNsp.to(gameCode).emit('play-transfer', err.message)
			}
		})
	})
}

export { router as LiteratureRouter, setupLiteratureGame }
