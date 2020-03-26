import socketio from 'socket.io'
import express from 'express'
import async from 'async'
import bodyParser from 'body-parser'
import {
	setupLiteratureGame,
	LiteratureRouter
} from './src/games/literature/api'

import { config } from './config'

const port = process.env.PORT ? process.env.PORT : config.express.port
const app = express()
var io

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

async.waterfall(
	[
		async () => {
			const server = app.listen(port)
			io = await socketio(server)
		},
		async () => {
			var litNsp = await io.of('/literature')
			setupLiteratureGame(io, litNsp)
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
