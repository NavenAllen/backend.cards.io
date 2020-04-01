import * as GameService from './game'
import * as PlayerService from './player'
import { config } from '../../config'
var MongoClient = require('mongodb').MongoClient

const setUpdatesCallback = (onGameUpdate, onPlayerUpdate) => {
	MongoClient.connect(
		'mongodb://' +
			config.mongodb.host +
			':' +
			config.mongodb.port +
			'/' +
			config.mongodb.db +
			'?replicaSet=rs',
		{ useNewUrlParser: true },
		function (err, database) {
			if (err) throw err
			var db = database.db('cards-io')
			const playersChangeStream = db
				.collection('players')
				.watch({ fullDocument: 'updateLookup' })
			playersChangeStream.on('change', async (change) => {
				var player = change.fullDocument
				player = await PlayerService.pluckById(player._id)
				onPlayerUpdate(player)
			})
			const gamesChangeStream = db
				.collection('games')
				.watch({ fullDocument: 'updateLookup' })
			gamesChangeStream.on('change', async (change) => {
				var game = change.fullDocument
				game = await GameService.pluckById(game._id)
				onGameUpdate(game)
			})
		}
	)
}

export { GameService, PlayerService, setUpdatesCallback }
