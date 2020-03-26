import { config } from '../../config'
import thinky = require('thinky')

var thinkyObject = thinky({
	host: config.rethinkdb.host,
	port: config.rethinkdb.port,
	db: config.rethinkdb.db
})

export { thinkyObject as thinky }
