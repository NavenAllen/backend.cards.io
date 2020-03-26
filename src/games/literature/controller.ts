import { Deck, Player, Game } from '../../engine'
import { GameService, PlayerService } from '../../services'

var testLit = async () => {
	var deck = new Deck()

	var numbers = ['five', 'six']
	const promises = numbers.map(number => Player.build('five'));

  	const results = await Promise.all(promises);
	console.log(results);
	let p1 = results[0]
	let p2 = results[1]

	PlayerService.getPlayerById(p2.id).then( player => {
		console.log(player)
	})

	Game.build('Literature', deck, 8, true, p1.id).then( game => {
		GameService.addPlayerToGame(game.id, p2.id)

		GameService.getGameByCode(game.code).then( game => {
			console.log(game)
		})
	})
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
	GameService.getGameByCode(code).then( g => {
		let game = new Game(g.type, g.deck, g.maxPlayers, g.isTeamGame)
	})
}

export { testLit }
