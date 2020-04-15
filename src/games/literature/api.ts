import express from 'express'
import * as LiteratureController from './controller'
import * as LiteratureValidator from './validator'
import * as Validator from '../../util/validator'
import { Game } from '../../engine'
import { setUpdatesCallback } from '../../services'

let router = express.Router()
let LiteratureNamespace
let gameMap = new Map()
let socketMap = new Map()

var setupLiteratureGame = async (NamespaceObject) => {
	LiteratureNamespace = NamespaceObject
	openSocketChannels()
	setUpdatesCallback(onGameUpdate, onPlayerUpdate)
}

var getGameData = (gameCode: string): Game => {
	return gameMap.get(gameCode)
}

var setGameData = (game: Game) => {
	gameMap.set(game.code, game)
}

var removeGameData = (game: Game) => {
	gameMap.delete(game.code)
}

var filterLogs = (game: any) => {
	let result: string[] = []
	let count = 3
	for (let i = game.logs.length; i > 0; i--) {
		if (
			game.logs[i - 1].startsWith('ASK') ||
			game.logs[i - 1].startsWith('TAKE')
		) {
			if (count > 0) {
				result.push(game.logs[i - 1])
				count--
			}
		} else {
			result.push(game.logs[i - 1])
		}
	}
	game.logs = result
}

var onGameUpdate = (game: any) => {
	filterLogs(game)
	console.log('GameData: ', game)
	LiteratureNamespace.to(game.code).emit('game-data', {
		type: 'GAME',
		data: game
	})
}

var onPlayerUpdate = (player: any) => {
	let socketId = socketMap.get(String(player.id))
	console.log('PlayerData: ', player)
	LiteratureNamespace.to(socketId).emit('player-data', {
		type: 'PLAYER',
		data: player
	})
}

var openSocketChannels = (): void => {
	LiteratureNamespace.on('connection', (socket) => {
		let pid = socket.handshake.query.pid
		// console.log('Connected to: ' + socket.id)
		// console.log('Received PlayerID: ' + pid)
		if (pid.length !== 0) {
			if (socketMap.has(pid)) {
				LiteratureNamespace.to(socket.id).emit('game-updates', {
					type: 'CONNECT',
					code: 403,
					name: 'SessionError',
					message: 'Another session is already active'
				})
			} else {
				LiteratureController.handleReconnect(pid)
					.then((response) => {
						// if (response.game.isActive) {
						socketMap.set(pid, socket.id)
						socket.join(response.game.code)
						filterLogs(response.game)
						LiteratureNamespace.to(socket.id).emit('game-updates', {
							type: 'CONNECT',
							code: 200,
							game: response.game,
							player: response.player
						})
						// }
					})
					.catch((err) => {
						LiteratureNamespace.to(socket.id).emit('game-updates', {
							type: 'CONNECT',
							code: 400,
							name: err.name,
							message: err.message
						})
					})
			}
		}

		socket.on('create', async (data) => {
			let playerName = data.name
			let playerPosition = 1
			let playerId = data.pid

			try {
				let player = await LiteratureController.registerPlayer(
					playerId,
					playerName,
					playerPosition
				)
				let game = await LiteratureController.hostGame(player)

				setGameData(game)
				socket.join(game.code)
				socketMap.set(player.id, socket.id)

				LiteratureNamespace.to(socket.id).emit('game-updates', {
					code: 200,
					type: 'CREATE',
					gcode: game.code,
					pid: player.id,
					pname: player.name
				})
			} catch (err) {
				LiteratureNamespace.to(socket.id).emit('game-updates', {
					type: 'CREATE',
					code: err.code,
					name: err.name,
					message: err.message
				})
			}
		})

		socket.on('probe', async (data) => {
			let gameCode = data.code
			try {
				let game = getGameData(gameCode)
				let response = game.getSpots()

				LiteratureNamespace.to(socket.id).emit('game-probe', {
					code: 200,
					data: response
				})
			} catch (err) {
				LiteratureNamespace.to(socket.id).emit('game-probe', {
					code: 400,
					name: 'GameError',
					message: 'No Game Found'
				})
			}
		})

		socket.on('join', async (data) => {
			let gameCode = data.code
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

				socket.join(game.code)
				socketMap.set(player.id, socket.id)

				let response = game.getSpots()
				LiteratureNamespace.to(socket.id).emit('game-updates', {
					code: 200,
					type: 'JOIN',
					pid: player.id,
					gcode: game.code,
					data: response
				})
			} catch (err) {
				LiteratureNamespace.to(socket.id).emit('game-updates', {
					type: 'JOIN',
					code: err.code,
					name: err.name,
					message: err.message
				})
			}
		})

		socket.on('leave', async (data) => {
			let gameCode = data.code
			let playerId = data.pid

			try {
				let game = getGameData(gameCode)
				let player = game.getPlayerById(playerId)

				let success = await LiteratureController.leaveGame(game, player)
				socket.leave(game.code)
				if (!success) removeGameData(game)

				LiteratureNamespace.to(socket.id).emit('game-updates', {
					code: 200,
					type: 'LEAVE'
				})
			} catch (err) {
				LiteratureNamespace.to(socket.id).emit('game-updates', {
					type: 'LEAVE',
					code: err.code,
					name: err.name,
					message: err.message
				})
			}
		})

		socket.on('start', (data) => {
			let gameCode = data.code
			let playerId = data.pid

			try {
				let game = getGameData(gameCode)
				let player = game.getPlayerById(playerId)

				Validator.isOwner(game, player)
				LiteratureController.startGame(game)

				LiteratureNamespace.to(gameCode).emit('game-updates', {
					code: 200,
					type: 'START'
				})
			} catch (err) {
				LiteratureNamespace.to(socket.id).emit('game-updates', {
					type: 'START',
					code: err.code,
					name: err.name,
					message: err.message
				})
			}
		})

		socket.on('play-ask', (data) => {
			let card = data.card
			let gameCode = data.code

			try {
				let game = getGameData(gameCode)
				let fromPlayer = game.getPlayerById(data.fid)
				let toPlayer = game.getPlayerByPosition(data.tpos)

				Validator.isMyTurn(game, fromPlayer)
				LiteratureValidator.canAsk(fromPlayer, toPlayer, card)
				LiteratureController.askForCard(
					game,
					fromPlayer,
					toPlayer,
					card
				)
				LiteratureNamespace.to(socket.id).emit('play-ask', {
					code: 200,
					type: 'ASK'
				})
			} catch (err) {
				LiteratureNamespace.to(socket.id).emit('play-ask', {
					code: err.code,
					name: err.name,
					message: err.message
				})
			}
		})

		socket.on('play-declare', (data) => {
			let gameCode = data.code
			let playerId = data.pid
			let declaration = data.declaration

			try {
				let game = getGameData(gameCode)
				let from = game.getPlayerById(playerId)

				Validator.isMyTurn(game, from)
				let set = LiteratureValidator.checkSameSet(declaration)
				LiteratureController.declareSet(game, from, set, declaration)
				LiteratureNamespace.to(socket.id).emit('play-declare', {
					code: 200,
					type: 'DECLARE'
				})
			} catch (err) {
				LiteratureNamespace.to(socket.id).emit('play-declare', {
					code: err.code,
					name: err.name,
					message: err.message
				})
			}
		})

		socket.on('play-transfer', (data) => {
			let gameCode = data.code
			let fromId = data.fid
			let toPos = data.tpos

			try {
				let game = getGameData(gameCode)
				let from = game.getPlayerById(fromId)

				Validator.isMyTurn(game, from)
				let to = game.getPlayerByPosition(toPos)

				Validator.areSameTeam(from, to)
				LiteratureValidator.didJustDeclare(game)
				LiteratureController.transferTurn(game, from, to)
				LiteratureNamespace.to(socket.id).emit('play-transfer', {
					code: 200,
					type: 'TRANSFER'
				})
			} catch (err) {
				LiteratureNamespace.to(socket.id).emit('play-transfer', {
					code: err.code,
					name: err.name,
					message: err.message
				})
			}
		})

		socket.on('disconnect', (reason) => {
			// console.log('Disconnected from: ' + socket.id)
			for (let [key, value] of socketMap.entries()) {
				if (value === socket.id) {
					socketMap.delete(key)
				}
			}
		})
	})
}

export { router as LiteratureRouter, setupLiteratureGame }
