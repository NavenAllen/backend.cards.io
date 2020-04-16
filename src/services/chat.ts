import { GameModel, PlayerModel, ChatModel } from '../models'

class DatabaseError extends Error {
	public code: number
	public scope: string
	constructor(code: number, scope: string, message: string) {
		super(message)
		this.code = code
		this.scope = scope
		Object.setPrototypeOf(this, new.target.prototype)
		this.name = DatabaseError.name
	}
}

var addMessage = async (message: string, gameId: string, playerId: string) => {
	try {
		var game = await GameModel.findById(gameId)
		var player = await PlayerModel.findById(playerId)
		if (!game || !player)
			throw new DatabaseError(
				500,
				'ADD-CHAT',
				'Player or Game does not exist'
			)
	} catch (err) {
		throw new DatabaseError(
			500,
			'ADD-CHAT',
			'Player or Game does not exist'
		)
	}

	var chatObject = new ChatModel({
		message: message,
		game: game,
		player: player
	})

	chatObject.save((err) => {
		if (err) throw new DatabaseError(500, 'ADD-CHAT', 'Unable to add chat')
	})
}

var destroyChats = (gameId: string) => {
	ChatModel.deleteMany({ game: gameId }, (err) => {
		if (err)
			throw new DatabaseError(
				500,
				'DESTROY-CHAT',
				'Unable to destroy chats for ' + gameId
			)
	})
}

var getAllChats = async (gameId: string) => {
	var chats = await ChatModel.find({ game: gameId })
		.populate('player', 'name position')
		.select({ message: 1 })
	return chats
}
