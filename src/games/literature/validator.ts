import { Player, Game } from "../../engine";

class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = ValidationError.name;
    }
}

const lowerClubs = ['2C', '3C', '4C', '5C', '6C', '7C']
const higherClubs = ['9C', '10C', 'JC', 'QC', 'KC', 'AC']

const lowerDiamonds = ['2D', '3D', '4D', '5D', '6D', '7D']
const higherDiamonds = ['9D', '10D', 'JD', 'QD', 'KD', 'AD']

const lowerSpades = ['2S', '3S', '4S', '5S', '6S', '7S']
const higherSpades = ['9S', '10S', 'JS', 'QS', 'KS', 'AS']

const lowerHearts = ['2H', '3H', '4H', '5H', '6H', '7H']
const higherHearts = ['9H', '10H', 'JH', 'QH', 'KH', 'AH']

const jokers = ['8C', '8D', '8S', '8D', 'JOKER', 'JOKER']

const canAsk = (player: Player, card: string) => {
	if (player.getHand().includes(card))
		throw new Error('Already have the card')

	let baseSet: string[]
	if (card.slice(-1) == 'C'){
		if (Number(card[0]) > 1 && Number(card[0]) < 8)
			baseSet = lowerClubs
		else
			baseSet = higherClubs
	} else if (card.slice(-1) == 'D'){
		if (Number(card[0]) > 1 && Number(card[0]) < 8)
			baseSet = lowerDiamonds
		else
			baseSet = higherDiamonds
	} else if (card.slice(-1) == 'S'){
		if (Number(card[0]) > 1 && Number(card[0]) < 8)
			baseSet = lowerSpades
		else
			baseSet = higherSpades
	} else if (card.slice(-1) == 'H'){
		if (Number(card[0]) > 1 && Number(card[0]) < 8)
			baseSet = lowerHearts
		else
			baseSet = higherHearts
	} else {
		baseSet = jokers
	}
	
	let intersection = player.getHand().filter((c: string) => {
		return baseSet.includes(c)
	})
	if (intersection.length === 0)
		throw new ValidationError('No base card')
}

const didJustDeclare = (game: Game) => {
	let lastLog = game.logs.slice(-1)[0]
	if (!lastLog.startsWith('DECLARE') && !lastLog.startsWith('TRANSFER'))
		throw new ValidationError('You can only transfer turn after declaring')
}

export { canAsk, didJustDeclare }