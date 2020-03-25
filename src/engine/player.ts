import { Card } from './index'

var PlayerError = (message): Error => {
  const error = new Error(message)
  error.message = 'PlayerError'
  return error
}
PlayerError.prototype = Object.create(Error.prototype)

export class Player {
  name: string;
  position: number;
  handState: Card[];

  constructor (playerName: string) {
    this.name = playerName
  }

  assignPosition = (pos): void => {
    this.position = pos
  };

  assignHand = (hand): void => {
    this.handState = hand
  };

  myHand = (): Card[] => {
    return this.handState
  };

  myHandToString = (): string[] => {
    return this.handState.map((c) => {
      return c.getNumber() + c.getSuite()
    })
  };

  addToHand = (card): void => {
    this.handState.push(card)
  };

  getIndexOf = (card): number => {
    for (let i = 0; i < this.handState.length; i++) {
      if (this.handState[i].value === card.value) {
        return i
      }
    }
    return -1
  };

  discardFromHand = (card): void => {
    const index = this.getIndexOf(card)
    if (index === -1) {
      throw PlayerError('Does not have the requested card')
    } else {
      this.handState.splice(index, index + 1)
    }
  };

  sortHand = (): void => {
    this.handState.sort((a, b) => {
      return a.value - b.value
    })
  };
}
