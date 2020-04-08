import mongoose from 'mongoose'

let Schema = mongoose.Schema

// Create the model
let gameSchema = new Schema(
	{
		type: String,
		code: String,
		deck: [String],
		pile: [String],
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Player'
		},
		currentTurn: Number,
		minPlayers: Number,
		maxPlayers: Number,
		isTeam: Boolean,
		isActive: Boolean,
		logs: [String],
		additionalData: {
			type: mongoose.Schema.Types.Mixed,
			default: {}
		}
	},
	{ timeStamps: true }
)

gameSchema.virtual('players', {
	ref: 'Player',
	localField: '_id',
	foreignField: 'game',
	justOne: false
})
gameSchema.set('toObject', { virtuals: true, getters: true, minimize: true })
gameSchema.set('toJSON', { virtuals: true, getters: true, minimize: true })

let Game = mongoose.model('Game', gameSchema)

export default Game
