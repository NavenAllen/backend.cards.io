import express from 'express'
import socketio from 'socket.io'
import bodyParser from 'body-parser'
import { assignSocketToApi } from './src/api'

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

const server = app.listen(port)
io = socketio(server)

io.on('connection', (socket) => {
  assignSocketToApi(socket)
})
