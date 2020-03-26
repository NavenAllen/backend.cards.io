let socket

var assignSocketToApi = (connectedSocket): void => {
	socket = connectedSocket
	openSocketChannels()
}

var openSocketChannels = (): void => {
	socket.emit('news', { hello: 'world' })
	socket.on('my other event', (data) => {
		console.log(data)
	})
}

export { assignSocketToApi }
