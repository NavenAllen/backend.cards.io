import { Deck, Player, Game } from '../../engine'
import { GameService, PlayerService } from '../../services'

var testLit = async () => {
	let po = await Player.build('Nandha', 2)
	hostGame(po).then(async (hostedGame) => {
		var p1 = await Player.build('Naven', 3)
		await hostedGame.addPlayer(p1)
		var p2 = await Player.build('Vivek', 1)
		await hostedGame.addPlayer(p2)

		GameService.getByCode(hostedGame.code).then((updatedGame) => {
			console.log(updatedGame[0])
		})
	})
}

var registerPlayer = async (id: string, name: string, pos: number) => {
	try {
		var player = await PlayerService.getById(id)
		player.name = name
		player.position = pos
	} catch (err) {
		player = await Player.build(name, pos)
	}
	return player
}

var getGame = async (code: string) => {
	return await GameService.getByCode(code)
}

var hostGame = async (owner: Player) => {
	const gameType = 'literature'
	const deck = new Deck()
	const minPlayers = 6
	const maxPlayers = 8
	const isTeamGame = true

	let g = await Game.build(gameType, deck, minPlayers, maxPlayers, isTeamGame, owner)
	return g
}

var joinGame = async (game: Game, player: Player) => {
	await game.addPlayer(player)
}

var startGame = async (game: Game) => {
	game.prepareGame()
}

var askForCard = async(game: Game, from: Player, to: Player, card: string) => {
	try {
		from.add(to.discard(card))
		console.log(from.name + ' took ' + card + ' from ' + to.name)
	} catch (err) {
		console.log(from.name + ' asked ' + to.name + ' for ' + card)
		game.currentTurn = to.position
	}
}

var transferTurn = async (game: Game, to: Player) => {
	game.currentTurn = to.position
	console.log('Turn transferred to ' + to.name)
}

var declareSet = async (
	game: Game,
	player: Player,
	declaration: string[][]
) => {
	let isPlayerEvenTeam = Number(player.position % 2 === 0)
	let successfull = true
	for (let i = 0; i < declaration.length; i++) {
		let currentPos = 2 * i + isPlayerEvenTeam
		for (let j = 0; j < declaration[i].length; j++) {
			let currentCard = declaration[i][j]
			let cardHolder = game.findCardWithPlayer(currentCard)
			if (cardHolder !== currentPos) {
				successfull = false
			}
			game.players[cardHolder].discard(currentCard)
		}
	}
	if (successfull) {
		player.score += 1
		console.log(player.name + ' correctly declared the ' + '')
	} else {
		game.players[(player.position + 1) % game.players.length].score += 1
		console.log(player.name + ' incorrectly declared the ' + '')
	}
}
export { getGame, registerPlayer, hostGame, joinGame, startGame, askForCard, transferTurn, declareSet }
