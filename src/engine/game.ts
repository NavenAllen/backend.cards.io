import { Card, Deck, Player } from './index'
import { GameService } from '../services'

var GameError = (message): Error => {
  const error = new Error(message)
  error.message = 'GameError'
  return error
}
GameError.prototype = Object.create(Error.prototype)

export class Game {
  type: string;
  code: string;
  nextPosition: number;
  gameDeck: Deck;
  maxPlayers: number;
  isTeamGame: boolean;
  players: Player[];
  pileState: Card[];
  currentTurn: number;
  databaseObjectId: string;
  processRound: Function;
  decideStarter: (player: Player) => boolean;
  decideTurn: Function;

  constructor (deck: Deck, maxPlayers: number, isTeamGame: boolean) {
    this.nextPosition = 0
    this.code = this.randomString(6)
    this.gameDeck = deck
    this.maxPlayers = maxPlayers
    this.isTeamGame = isTeamGame
    this.players = []
    this.pileState = []
    // this.currentRound = [];
    GameService.createGame(
      this,
      this.onGameCreationSuccess,
      this.onGameCreationFailure
    )
  }

  onGameCreationSuccess = (data): void => {
    this.databaseObjectId = data.id
  };

  onGameCreationFailure = (error): void => {
    throw GameError(error.msg)
  };

  getType = (): string => {
    return this.type
  };

  getCode = (): string => {
    return this.code
  };

  getGameDeck = (): Deck => {
    return this.gameDeck
  };

  ifTeamGame = (): boolean => {
    return this.isTeamGame
  };

  getPlayers = (): Player[] => {
    return this.players
  };

  getPileState = (): Card[] => {
    return this.pileState
  };

  getPileStateString = (): String[] => {
    return this.pileState.map((c) => {
      return c.getNumber() + c.getSuite()
    })
  };

  getCurrentTurn = (): number => {
    return this.currentTurn
  };

  getMaxPlayers = (): number => {
    return this.maxPlayers
  };

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
        console.log(this.players[index].getHandStateString())
      })
  };

  randomString = (len): string => {
    var charSet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var randomString = ''
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length)
      randomString += charSet.substring(randomPoz, randomPoz + 1)
    }
    return randomString
  };
}
