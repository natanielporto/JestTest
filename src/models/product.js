import { uuid } from 'uuidv4'

export default class Product {
  constructor (code, description, buyPrice, sellPrice, tags, lovers = 0, id = uuid()) {
    this.code = code;
    this.description = description;
    this.buyPrice = buyPrice;
    this.sellPrice = sellPrice;
    this.lovers = lovers;
    this.tags = tags;
    this.id = id;
  }
}