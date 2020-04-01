import mongoose from 'mongoose'

let Schema = mongoose.Schema

// Create the model
let playerSchema = new Schema(
	{
		name: String,
		position: Number,
		hand: [String],
		score: Number,
		game: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Game'
		}
	},
	{
		timestamps: true
	}
)

let Player = mongoose.model('Player', playerSchema)

// make this available to our users in our Node applications
export default Player
