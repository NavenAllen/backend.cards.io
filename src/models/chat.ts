import mongoose from 'mongoose'

let Schema = mongoose.Schema

// Create the model
let chatSchema = new Schema(
	{
		message: String,
		game: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Game'
		},
		player: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Player'
		}
	},
	{
		timestamps: true
	}
)

let Chat = mongoose.model('Chat', chatSchema)

export default Chat
