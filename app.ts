import socketio from 'socket.io'
import express from 'express'
import async from 'async'
import http from 'http'
import bodyParser from 'body-parser'
import {
	setupLiteratureGame,
	LiteratureRouter
} from './src/games/literature/api'

import { config } from './config'

const port = process.env.PORT ? process.env.PORT : config.express.port
const app = express()
var io, server

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// catch 400
app.use((err, req, res, next) => {
	console.log(err.stack)
	res.status(400).send(`Error: ${String(res.originUrl)} not found`)
	next()
})

// catch 500
app.use((err, req, res, next) => {
	console.log(err.stack)
	res.status(500).send(`Error: ${String(err)}`)
	next()
})

app.use(LiteratureRouter)
server = http.createServer(app)

async.waterfall(
	[
		async (callback) => {
			io = await socketio.listen(server)
			callback()
		},
		async () => {
			var litNsp = await io.of('/literature')
			setupLiteratureGame(litNsp)
			server.listen(port)
		}
	],
	function (err) {
		if (err) {
			console.error(err)
			process.exit(1)
			return
		}
	}
)
