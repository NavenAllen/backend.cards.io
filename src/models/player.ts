import { thinky } from '../util/thinky'

var type = thinky.type

// Create the model
var Player = thinky.createMode('player', {
  id: type.string(),
  name: type.string(),
  position: type.number(),
  hand: [type.string()],
  score: type.number(),
  gameId: type.string(),
  createdAt: type.date().default(thinky.r.now())
})

// Ensure that an index createdAt exists
Player.ensureIndex('createdAt')

export { Player }
