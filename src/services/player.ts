import { Player } from '../engine'
import { PlayerModel } from '../models'

var create = async (player: Player) => {
	var playerObject = new PlayerModel({
		name: player.name,
		position: player.position,
		hand: player.getHand(),
		score: player.score
	})

	var player = await playerObject.saveAll()
	return player
}

var updateScore = async (id: string, score: number) => {
	let player = await PlayerModel.get(id).run()
	player.score = score
	player.save()
}

var updateHand = async (id: string, hand: string[]) => {
	let player = await PlayerModel.get(id).run()
	player.hand = hand
	player.save()
}

var getById = async (id: string) => {
	let player = await PlayerModel.get(id).getJoin({game: true}).run()
	return player
}

export { create , getById, updateHand , updateScore }
