import express from 'express'
import * as LiteratureController from './controller'
import * as LiteratureValidator from './validator'
import * as Validator from '../../util/validator'
import { Game, Player } from '../../engine'
import { GameService, PlayerService } from '../../services'

let router = express.Router()
let litNsp,
	gameData = {},
	socketIDMap = {}

var setupLiteratureGame = async (litNspObject) => {
	litNsp = litNspObject
	openSocketChannels()
	setUpdateEventListeners()
}

var getGameData = (gameCode: string): Game => {
	return gameData[gameCode]
}

var setGameData = (game: Game) => {
	gameData[game.code] = game
}

var onGameUpdate: Function = async (game: Game) => {
	litNsp.to(game.code).emit('game-data', game)
}

var onPlayerUpdate = (player: Player) => {
	let socketId = socketIDMap[player.id]
	litNsp.to(socketId).emit('player-data', player)
}

var openSocketChannels = (): void => {
	litNsp.on('connection', (socket) => {
		socket.on('create', async (data) => {
			let playerName = data.name
			let playerPosition = 1
			let playerId = data.pid
			let gameCode

			try {
				let player = await LiteratureController.registerPlayer(
					playerId,
					playerName,
					playerPosition
				)
				let game = await LiteratureController.hostGame(player)
				gameCode = game.code

				setGameData(game)
				socket.join(game.code)
				socketIDMap[socket.id] = playerId

				litNsp
					.to(game.code)
					.emit('game-updates', player.name + ' has joined the game')
			} catch (err) {
				litNsp.to(gameCode).emit('game-updates', err.message)
			}
		})

		socket.on('probe', async (data) => {
			let gameCode = data.gameCode

			try {
				let game = getGameData(gameCode)
				let response = game.getSpots()

				litNsp.to(socket.id).emit('game-probe', response)
			} catch (err) {
				litNsp.to(gameCode).emit('game-probe', err.message)
			}
		})

		socket.on('join', async (data) => {
			let gameCode = data.gameCode
			let playerName = data.name
			let playerPosition = data.position
			let playerId = data.pid

			try {
				let game = getGameData(gameCode)

				Validator.isPositionAvailable(game, playerPosition)
				let player = await LiteratureController.registerPlayer(
					playerId,
					playerName,
					playerPosition
				)
				await LiteratureController.joinGame(game, player)

				setGameData(game)
				socket.join(game.code)
				socketIDMap[socket.id] = playerId

				litNsp
					.to(game.code)
					.emit('game-updates', player.name + ' has joined the game')
			} catch (err) {
				litNsp.to(gameCode).emit('game-updates', err.message)
			}
		})

		socket.on('leave', async (data) => {
			let gameCode = data.gameCode
			let playerId = data.pid

			try {
				let game = getGameData(gameCode)
				let player = game.getPlayerById(playerId)
				await LiteratureController.joinGame(game, player)

				setGameData(game)
				socket.leave(game.code)
				socketIDMap[socket.id] = playerId

				litNsp
					.to(game.code)
					.emit('game-updates', player.name + ' has left the game')
			} catch (err) {
				litNsp.to(gameCode).emit('game-updates', err.message)
			}
		})

		socket.on('start', (data) => {
			let gameCode = data.gameCode
			let playerId = data.playerId

			try {
				let game = getGameData(gameCode)
				let player = game.getPlayerById(playerId)

				Validator.isOwner(game, player)
				LiteratureController.startGame(game)

				setGameData(game)
				litNsp.to(gameCode).emit('game-updates', 'Started game')
			} catch (err) {
				litNsp.to(gameCode).emit('game-updates', err.message)
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
				LiteratureValidator.didJustDeclare(game)
				LiteratureController.transferTurn(game, from, to)
				litNsp.to(gameCode).emit('play-transfer', 'Transferred turn')
			} catch (err) {
				litNsp.to(gameCode).emit('play-transfer', err.message)
			}
		})
	})
}

var setUpdateEventListeners = () => {
	GameService.setGameUpdatesCallback(onGameUpdate)
	PlayerService.setPlayerUpdatesCallback(onPlayerUpdate)
}

export { router as LiteratureRouter, setupLiteratureGame }
