import { Player } from './player'
import { Game } from './game'

Game.belongsTo(Player, 'owner', 'ownerId', 'id')

Game.hasMany(Player, 'players', 'id', 'gameId')
Player.belongsTo(Game, 'game', 'gameId', 'id')

export { Player as PlayerModel, Game as GameModel }
