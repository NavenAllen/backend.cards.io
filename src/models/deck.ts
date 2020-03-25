import { thinky } from '../util/thinky'
import { Card } from './card'

var type = thinky.type

// Create the model
var Deck = thinky.createModel('deck', {
  id: type.string(),
  gameId: type.string(),
  createdAt: type.date().default(thinky.r.now())
})

// Ensure that an index createdAt exists
Deck.ensureIndex('createdAt')
Deck.hasAndBelongsToMany(Card, 'cards', 'id', 'id')

export { Deck }
