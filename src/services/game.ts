import { Game } from '../engine'
import { Game as GameModel } from '../models'

var createGame = (
  gameDetails: Game,
  onGameCreationSuccess: Function,
  onGameCreationFailure: Function
): void => {
  var gameObject = new GameModel({
    type: gameDetails.getType(),
    code: gameDetails.getCode(),
    deck: gameDetails.getGameDeck().allCardsToString(),
    pile: gameDetails.getPileStateString(),
    maxPlayers: gameDetails.getMaxPlayers(),
    isTeam: gameDetails.ifTeamGame()
  })

  gameObject
    .save()
    .then((result) => {
      onGameCreationSuccess(result)
    })
    .error((err) => {
      onGameCreationFailure(err)
    })
}

export { createGame }
