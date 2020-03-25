import { Deck, Player, Game } from '../../engine'
import { GameService, PlayerService } from '../../services'

var testLit = async () => {
	var deck = new Deck()

	var p1 = await Player.build('five')
	var p2 = await Player.build('six')
	console.log(p2)

	let c = await PlayerService.getPlayerById(p2.id)
	console.log(c)

	var game = await Game.build('Literature', deck, 8, true, p1.id)
	await GameService.addPlayerToGame(game.id, p2.id)

	c = await GameService.getGameByCode(game.code)
	console.log(c)
}

var registerPlayer = async(name: string) => {
	let p = await Player.build(name)
	return p.id
}

var hostGame = async(type: string, owner: string) => {
	const deck = new Deck()
	const maxPlayers = 8
	const isTeamGame = true

	let g = await Game.build(type, deck, maxPlayers, isTeamGame, owner)
	return g.code
}

var joinGame = async(code: string, player: string) => {
	await GameService.addPlayerToGame(code, player)
}

var startGame = async(code: string, player: string) => {
	let g = await GameService.getGameByCode(code)
	let game = new Game(g.type, g.deck, g.maxPlayers, g.isTeamGame)
}

export { testLit }
