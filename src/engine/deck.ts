import { CardService } from '../services'

var DeckError = (message: string): Error => {
  const error = new Error(message)
  error.message = 'DeckError'
  return error
}
DeckError.prototype = Object.create(Error.prototype)

export class Card {
  number: string;
  suite: string;
  value: number;
  dataObjectId: string;

  constructor (number: string, suite: string) {
    this.number = number
    this.suite = suite

    this.value = parseInt(number)
    if (number === 'J') this.value = 11
    if (number === 'Q') this.value = 12
    if (number === 'K') this.value = 13
    if (number === 'A') this.value = 14

    switch (suite) {
      case 'C':
        this.value += 100
        break
      case 'D':
        this.value += 200
        break
      case 'S':
        this.value += 300
        break
      case 'H':
        this.value += 400
        break
      case 'JOKER':
        this.value = 500
    }
    CardService.createCard(
      this,
      this.onCardCreationSuccess,
      this.onCardCreationFailure
    )
  }

  getNumber = (): string => {
    return this.number
  };

  getSuite = (): string => {
    return this.suite
  };

  getValue = (): number => {
    return this.value
  };

  onCardCreationSuccess = (id: string): void => {
    this.dataObjectId = id
    console.log(this.dataObjectId)
  };

  onCardCreationFailure = (error: string): void => {
    throw DeckError(error)
  };
}

export class Deck {
  deckState: Card[];

  constructor (excludeJokers = false, deckCount = 1, exclusions: string[] = []) {
    exclusions.filter((e) => {
      if (!e.match(/([2-9]|10|[JQKA])[SCDH]/)) {
        throw DeckError('Invalid Card => ' + e)
      }
    })

    this.deckState = []
    const numbers = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K'
    ]
    const suites = ['C', 'D', 'S', 'H']

    while (deckCount > 0) {
      suites.forEach((suite) => {
        numbers.forEach((number) => {
          var currentCard = new Card(number, suite)
          if (!exclusions.includes(number + suite)) {
            this.deckState.push(currentCard)
          }
        })
      })

      if (!excludeJokers) {
        this.deckState.push(new Card('', 'JOKER'), new Card('', 'JOKER'))
      }

      deckCount--
    }
  }

  allCards = (): Card[] => {
    return this.deckState
  };

  allCardsToString = (): string[] => {
    return this.deckState.map((c) => {
      return c.number + c.suite
    })
  };

  shuffle = (n = 5): void => {
    while (n > 0) {
      let currentIndex = this.deckState.length
      let temporaryValue
      let randomIndex
      while (currentIndex !== 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        // And swap it with the current element.
        temporaryValue = this.deckState[currentIndex]
        this.deckState[currentIndex] = this.deckState[randomIndex]
        this.deckState[randomIndex] = temporaryValue
      }
      n--
    }
  };

  deal = (playerCount, cardCount = 0): Card[][] => {
    let enablePile = true
    if (cardCount === 0) {
      cardCount = Math.floor(this.deckState.length / playerCount)
      enablePile = false
    } else if (cardCount * playerCount > this.deckState.length) {
      throw DeckError('Not enough cards in deck')
    }

    this.shuffle()

    const result = []
    const excess = this.deckState.length - playerCount * cardCount
    while (playerCount > 0) {
      const playerHand = this.deckState.splice(0, cardCount)
      result.push(playerHand)
      playerCount--
    }

    if (!enablePile) {
      for (let index = 0; index < excess; index++) {
        result[index].push(this.deckState.splice(0, 1)[0])
      }
    }

    return result
  };

  drawFromPile = (): Card => {
    return this.deckState.splice(0, 1)[0]
  };

  refreshPile = (discardPile): void => {
    this.deckState = discardPile
    this.shuffle()
  };
}
