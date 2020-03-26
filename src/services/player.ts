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

var updateName = async (id: string, name: string) => {
	let player = await PlayerModel.get(id).run()
	player.name = name
	player.save()
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

var getById = async (id: string): Promise<Player> => {
	try {
		var p = await PlayerModel.get(id).getJoin({game: true}).run()
	} catch (err) {
		throw new Error('Player does not exist')
	}
	return Player.fromModelObject(p)
}

export { create , getById, updateName, updateHand , updateScore }
