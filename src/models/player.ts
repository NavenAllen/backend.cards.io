import { thinky } from '../util/thinky'

var type = thinky.type

// Create the model
var Player = thinky.createModel('player', {
	id: type.string(),
	name: type.string(),
	position: type.number(),
	hand: [type.string()],
	score: type.number(),
	gameId: type.string(),
	createdAt: type.date()
})

// Ensure that an index createdAt exists
Player.ensureIndex('createdAt')

export { Player }
