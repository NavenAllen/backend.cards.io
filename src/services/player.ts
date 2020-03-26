import { Player } from '../engine'
import { PlayerModel } from '../models'

var createPlayer = async (player: Player) => {
	var playerObject = new PlayerModel({
		name: player.name,
		position: player.position,
		hand: player.getHandAsString(),
		score: player.score
	})

	var player = await playerObject.saveAll()
	return player
}

var getPlayerById = async (id: string) => {
	let player = PlayerModel.get(id).getJoin({ game: true }).run()
	return player
}

export { createPlayer, getPlayerById }
