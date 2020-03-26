import { Player } from '../engine'
import { PlayerModel } from '../models'

var createPlayer = async (
	player: Player,
	onPlayerCreationSuccess: Function,
	onPlayerCreationFailure: Function
) => {
	var playerObject = new PlayerModel({
		name: player.name,
		position: player.position,
		hand: player.getHandAsString(),
		score: player.score
	})

	await playerObject.saveAll().then((result) => {
		onPlayerCreationSuccess(result)
	}).error((err) => {
		onPlayerCreationFailure(err)
	})
}

var getPlayerById = async (id: string) => {
	return PlayerModel.get(id).getJoin({game: true}).run();
}

export { createPlayer, getPlayerById }