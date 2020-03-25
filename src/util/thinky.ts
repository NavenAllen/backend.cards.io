import { config } from '../../config';

var thinky = require('thinky')({
    host: config.rethinkdb.host,
    port: config.rethinkdb.port,
    db: config.rethinkdb.db
})

export { thinky };