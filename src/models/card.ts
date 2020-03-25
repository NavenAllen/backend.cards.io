import { thinky } from '../util/thinky'

var type = thinky.type

// Create the model
var Card = thinky.createModel('card', {
  id: type.string(),
  number: type.string(),
  suite: type.string(),
  value: type.number(),
  createdAt: type.date().default(thinky.r.now())
})

// Ensure that an index createdAt exists
Card.ensureIndex('createdAt')

export { Card }
