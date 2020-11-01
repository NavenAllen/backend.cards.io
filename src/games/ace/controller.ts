import { Deck, Player, Game } from '../../engine'
import { GameService, PlayerService, ChatService } from '../../services'
import { Logger } from '../../util/logger'

var handleReconnect = async (id: string) => {
	let p = await PlayerService.pluckById(id)
	let g = await GameService.pluckById(p.game)
	let c = await ChatService.getAllChats(p.game)
	return { player: p, game: g, chats: c }
}

var registerPlayer = async (id: string, name: string, pos: number) => {
	try {
		var player = await PlayerService.getObjectById(id)
		player.updateDetails(name, pos)
	} catch (err) {
		player = await Player.build(name, pos)
	}
	return player
}

var hostGame = async (owner: Player) => {
	const gameType = 'ace'
	const deck = new Deck(true)
	const minPlayers = 4
	const maxPlayers = 5
	const isTeamGame = false

	let g = await Game.build(
		gameType,
		deck,
		minPlayers,
		maxPlayers,
		isTeamGame,
		owner
	)
	setGameFunctions(g)
	g.log('CREATE:' + owner.name)
	g.setAdditionalData('currentSuit', '')

	return g
}

var joinGame = async (game: Game, player: Player) => {
	await game.addPlayer(player)
	game.log('JOIN:' + player.name)
}

var leaveGame = async (game: Game, player: Player) => {
	let success = await game.removePlayer(player)
	if (success) {
		game.log('LEAVE:' + player.name)
		return true
	} else return false
}

var startGame = (game: Game) => {
	game.prepareGame()
	game.log('START')
}

var cardValue = (card: String) => {
	let num = card.slice(0, -1)
	let value = 0
	if (num === 'A') value = 14
	else if (num === 'K') value = 13
	else if (num === 'Q') value = 12
	else if (num === 'J') value = 11
	else value = Number(num)
	return value
}

const updateCurrentTurn = (game: Game) => {
	let nextPlayer =
		game.currentTurn === game.players.length ? 1 : game.currentTurn + 1
	let roundStarter = game.getAdditionalData('roundStarter')
	while (
		nextPlayer !== roundStarter &&
		game.getPlayerByPosition(nextPlayer).hand.length === 0
	) {
		nextPlayer = nextPlayer === game.players.length ? 1 : nextPlayer + 1
	}
	if (nextPlayer === roundStarter) {
		game.processRound()
	} else {
		game.currentTurn = nextPlayer
	}
}

var playCard = async (game: Game, player: Player, card: string) => {
	let currentSuit = game.getAdditionalData('currentSuit')
	if (currentSuit.length === 0) {
		game.setAdditionalData('currentSuit', card.slice(-1))
		game.setAdditionalData('roundStarter', player.position)
		game.setAdditionalData('topCard', card)
		game.setAdditionalData('topPlayer', player.position)
		player.discard(card)
		game.discardToPile(card)
	} else {
		if (card.slice(-1) === currentSuit) {
			let topCard = game.getAdditionalData('topCard')
			if (cardValue(card) > cardValue(topCard)) {
				game.setAdditionalData('topCard', card)
				game.setAdditionalData('topPlayer', player.position)
			}
			player.discard(card)
			game.discardToPile(card)
			updateCurrentTurn(game)
		} else {
			player.discard(card)
			game.discardToPile(card)
			let topPlayer = game.getPlayerByPosition(
				game.getAdditionalData('topPlayer')
			)
			game.pile.forEach((card) => {
				topPlayer.add(card)
			})
			game.processRound()
		}
	}
}

const addChat = (message: string, game: Game, player: Player) => {
	ChatService.addChat(message, game.id, player.id)
}

var setGameFunctions = (game: Game) => {
	game.decideStarter = function () {
		for (let i = 0; i < this._players.length; i++) {
			if (this._players[i].getIndexOf('AS') !== -1)
				return (this._currentTurn = i + 1)
		}
	}
	game.isGameOver = function () {
		let count = 0
		for (let i = 0; i < this._players.length; i++) {
			if (this._players[i].hand.length > 0) count++
		}
		return count <= 1
	}
	game.processRound = function () {
		if (this._isGameOver()) this.end()
		else {
			this.discardPile()
			this.setAdditionalData('currentSuit', '')
			this._currentTurn = this.getAdditionalData('topPlayer')
		}
	}
	game.activePlayers = function () {
		let activePlayers = []
		this._players.forEach((player) => {
			if (player.hand.length) activePlayers.push(player)
		})
		return activePlayers
	}
}

export {
	handleReconnect,
	registerPlayer,
	hostGame,
	joinGame,
	leaveGame,
	startGame,
	playCard,
	setGameFunctions,
	addChat
}
