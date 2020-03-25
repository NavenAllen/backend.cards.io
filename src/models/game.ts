import { thinky } from '../util/thinky'

import { Player } from './index'

var type = thinky.type

// Create the model
var Game = thinky.createModel('game', {
  id: type.string(),
  type: type.string(),
  code: type.string(),
  ownerId: type.string(),
  deck: [type.string()],
  pile: [type.string()],
  currentTurn: type.number(),
  maxPlayers: type.number(),
  isTeam: type.boolean(),
  createdAt: type.date().default(thinky.r.now())
})

// Ensure that an index createdAt exists
Game.ensureIndex('createdAt')
Game.belongsTo(Player, 'owner', 'ownerId', 'id')
Game.hasMany(Player, 'players', 'id', 'gameId')

export { Game }
