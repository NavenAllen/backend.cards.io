import socketio from 'socket.io'

let io

var startSocketIOServer = (server): void => {
  io = socketio(server)
  var address = io.handshake.address
  console.log(
    'New connection from ' +
      String(address.address) +
      ':' +
      String(address.port)
  )
}

export { startSocketIOServer }
