export default class Validator {
  static validProduct(product) {
    const { description } = product;
    if (description.length < 3 || description.length > 50) {
      throw new Error ('Descrição deve estar entre 3 e 50 caracteres')
    } else {
      return product;
    }
  }

  static validPrice(product) {
    const {buyPrice, sellPrice} = product;
    if (buyPrice > sellPrice) {
      throw new Error ('Erro: valor de compra não pode ser maior que o valor de venda.')
    } else {
      return product;
    }
  }

  static abovePrice(product) {
    const {buyPrice, sellPrice} = product;
    if (buyPrice < 0) {
      throw new Error ('Erro: valor de compra não pode ser negativo.')
    } 
    if (sellPrice < 0) {
      throw new Error ('Erro: valor de venda não pode ser negativo.')
    }
    return product;
  }
}

