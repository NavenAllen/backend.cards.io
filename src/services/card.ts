import { Card } from '../engine'
import { Card as CardModel } from '../models'

var createCard = (
  card: Card,
  onSuccess: Function,
  onFailure: Function
): void => {
  CardModel.save({
    number: card.getNumber(),
    suite: card.getSuite(),
    value: card.getValue()
  })
    .then((result) => {
      onSuccess(result.id)
    })
    .error((error) => {
      onFailure(error.msg)
    })
}

export { createCard }
