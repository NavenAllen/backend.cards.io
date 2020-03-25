import { thinky } from '../util/thinky'

var type = thinky.type

// Create the model
var Game = thinky.createModel('game', {
	id: type.string(),
	type: type.string(),
	code: type.string(),
	deck: [type.string()],
	pile: [type.string()],
	currentTurn: type.number(),
	maxPlayers: type.number(),
	isTeam: type.boolean(),
	createdAt: type.date().default(thinky.r.now())
})

// Ensure that an index createdAt exists
Game.ensureIndex('createdAt')

export { Game }
