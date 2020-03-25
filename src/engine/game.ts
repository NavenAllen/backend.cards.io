import { Card, Deck, Player } from './index'

var GameError = (message): Error => {
  const error = new Error(message)
  error.message = 'GameError'
  return error
}
GameError.prototype = Object.create(Error.prototype)

export class Game {
  nextPosition: number;
  gameDeck: Deck;
  maxPlayers: number;
  isTeamGame: boolean;
  players: Player[];
  pileState: Card[];
  currentTurn: number;
  processRound: Function;
  decideStarter: (player: Player) => boolean;
  decideTurn: Function;

  constructor (deck: Deck, maxPlayers: number, isTeamGame: boolean) {
    this.nextPosition = 0
    this.gameDeck = deck
    this.maxPlayers = maxPlayers
    this.isTeamGame = isTeamGame
    this.players = []
    this.pileState = []
    // this.currentRound = [];
  }

  addPlayer = (newPlayer: Player): void => {
    if (this.players.length === this.maxPlayers) {
      throw GameError('Player limit reached')
    } else {
      newPlayer.assignPosition(this.nextPosition++)
      this.players.push(newPlayer)
    }
  };

  discardToPile = (card): void => {
    this.pileState.push(card)
  };

  setRoundProcessor = (processor): void => {
    // processor should clear pile after every round
    this.processRound = processor.bind(this)
  };

  setStartingDecision = (decision): void => {
    if (decision === undefined) {
      const env = {
        random: Math.floor((Math.random() * 10) % this.players.length)
      }
      this.decideStarter = function (player) {
        return player.position === this.random
      }
      this.decideStarter = this.decideStarter.bind(env)
    } else {
      this.decideStarter = decision.bind(this)
    }
  };

  makeStartingDecision = (): void => {
    for (let i = 0; i < this.players.length; i++) {
      if (this.decideStarter(this.players[i])) {
        this.currentTurn = i
        break
      }
    }
  };

  setTurnDecision = (decision): void => {
    this.decideTurn = decision.bind(this)
  };

  prepareGame = (cardCount = 0): void => {
    if (this.isTeamGame && this.players.length % 2 !== 0) {
      throw GameError('Not enough players')
    }

    this.gameDeck
      .deal(this.players.length, cardCount)
      .forEach((hand, index) => {
        this.players[index].assignHand(hand)
        console.log(this.players[index].myHandToString())
      })
  };
}
