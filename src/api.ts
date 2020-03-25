import socketio from 'socket.io'

let io

var startSocketIOServer = (server) => {
  io = socketio(server)
  console.log('Listening on port ')
}

export { startSocketIOServer }
