/* eslint-disable no-undef */
import request from 'supertest';
import Product from '../src/models/product'
import Validator from '../src/utils/Validator'

import app from '../src/app';

let products;

beforeEach(() => {
  products = [new Product(
    12,
    'Placa de vídeo ZT-650',
    40.00,
    80.00,
    ['tecnologia', 'computador', 'gamer'],
    ),
    new Product(
    99,
    'Macbook Pro Retina 2020',
    4000.00,
    6000.00,
    ['tecnologia', 'macbook', 'apple', 'macOS'],
  )];
});

test('deve ser possível criar um novo produto', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);

  expect(response.body).toMatchObject({
    ...products[0],
    lovers: 0,
  });
});

test('o status code de um produto criado deverá ser 201', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);
  expect(response.status).toBe(201);
});

test('deve ser possível atualizar dados de um produto', async () => {
  const responseSave = await request(app)
    .post('/products')
    .send(products[0]);
  const updatedProduct = {
    ...products[0],
    description: 'Macbook Pro Alterado',

  };
  const responseUpdate = await request(app)
    .put(`/products/${responseSave.body.id}`)
    .send(updatedProduct);

  expect(responseUpdate.body).toMatchObject(updatedProduct);
});

test('não deve ser possível atualizar um produto inexistente', async () => {
  await request(app)
    .put('/products/999999')
    .expect(400);
});

test('não deve ser possível remover um produto inexistente', async () => {
  await request(app)
    .put('/products/999999')
    .expect(400);
});

test('deve retornar o código 204 quando um produto for removido', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);

  await request(app)
    .delete(`/products/${response.body.code}`)
    .expect(204);
});

test('deve ser possível remover os produtos pelo código', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);

  await request(app)
    .post('/products')
    .send(products[1]);

  await request(app)
    .delete(`/products/${response.body.code}`)
    .expect(204);

  const all = await request(app)
    .get('/products');

  expect(all.body).not.toMatchObject([{ code: response.body.code }]);
});

test('deve ser possível listar todos os produtos', async () => {
  const responseSave = await request(app)
    .post('/products')
    .send(products[0]);

  const response = await request(app)
    .get('/products');
  expect(response.body).toEqual(
    expect.arrayContaining([
      {
        id: responseSave.body.id,
        ...products[0],
        lovers: 0,
      },
    ]),
  );
});

test('Deve ser possível buscar produtos por código no array', async () => {
  await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 40,
    });

  await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 40,
    });

  const responseGet = await request(app).get('/products/40');
  expect(responseGet.body).toHaveLength(2);
});

test('não deve ser possível atualizar o número de lovers de um produto manualmente', async () => {
  const responseSave = await request(app)
    .post('/products')
    .send(products[0]);
  const updatedProduct = {
    ...products[0],
    lovers: 10000000,
  };
  const responseUpdate = await request(app)
    .put(`/products/${responseSave.body.id}`)
    .send(updatedProduct);

  expect(responseUpdate.body.lovers).toBe(0);
});

test('deve ser possível dar love em um produto', async () => {
  const response = await request(app)
    .post('/products')
    .send(products[0]);

  const response2 = await request(app)
    .post(`/products/${response.body.code}/love`)
    .send(response.body);

  expect(response2.body).toMatchObject({
    lovers: 1,
  });
});

test('deve possuir o número de lovers igual a 0 um produto recém criado o qual o seu código seja inexistente', async () => {
  const response = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 12344321,
      lovers: 10,
    });
  expect(response.body).toMatchObject({
    lovers: 0,
  });
});

test('Um produto deverá herdar o número de lovers caso seu código já exista', async () => {
  const response = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 201,
    });

  await request(app)
    .post(`/products/${response.body.code}/love`)
    .send(response.body);

  const response2 = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 201,
    });

  expect(response2.body).toMatchObject({
    lovers: 1,
  });
});

test('Produtos de mesmo código devem compartilhar os lovers', async () => {
  const response = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 201,
    });

  await request(app)
    .post(`/products/${response.body.code}/love`)
    .send(response.body);

  const response2 = await request(app)
    .post('/products')
    .send({
      ...products[0],
      code: 201,
    });

  await request(app)
    .post(`/products/${response2.body.code}/love`)
    .send(response2.body);


  expect(response2.body).toMatchObject({
    lovers: 2,
  });
});

test('Não deve ser aceita a descrição com 2 caracteres', () => {
  expect(() => {
    Validator.validProduct(new Product(
      144,
      'Pl',
      50.00,
      80.00,
      ['tecnologia', 'computador', 'gamer'],
    ));
  }).toThrow(new Error('Descrição deve estar entre 3 e 50 caracteres'));
});

test('Deve aceitar a descrição com 3 caracteres', () => {
  const product = Validator.validProduct(new Product(
    144,
    'Plaf',
    50.00,
    80.00,
    ['tecnologia', 'computador', 'gamer'],
  ));
  expect(product.description).toBe('Plaf')
});

test('Não deve ser aceita a descrição com 51 caracteres', () => {
  expect(() => {
    Validator.validProduct(new Product(
      144,
      'Plaf555555Plaf555555Plaf555555Plaf555555Plaf5555551',
      50.00,
      80.00,
      ['tecnologia', 'computador', 'gamer'],
    ));
  }).toThrow(new Error('Descrição deve estar entre 3 e 50 caracteres'));
});

test('Deve aceitar a descrição com 50 caracteres', () => {
  const product = Validator.validProduct(new Product(
    144,
    'Plaf555555Plaf555555Plaf555555Plaf555555Plaf555555',
    50.00,
    80.00,
    ['tecnologia', 'computador', 'gamer'],
  ));
  expect(product.description).toBe('Plaf555555Plaf555555Plaf555555Plaf555555Plaf555555')
});

test('Não deve aceitar valor de compra maior que o valor de venda', () => {
  expect(() => {
    Validator.validPrice(new Product(
      144,
      'Placa mãe Asus',
      100.00,
      80.00,
      ['tecnologia', 'computador', 'gamer'],
    ));
  }).toThrow(new Error('Erro: valor de compra não pode ser maior que o valor de venda.'));
});

test('Deve aceitar valor de venda maior que o valor de compra', () => {
  const product = Validator.validPrice(new Product(
    144,
    'Placa Mãe Asus',
    50.00,
    80.00,
    ['tecnologia', 'computador', 'gamer'],
  ));
  expect(product.sellPrice).toBe(80.00)
});

test('Não deve aceitar valor de compra negativo', () => {
  expect(() => {
    Validator.abovePrice(new Product(
      144,
      'Placa mãe Asus',
      -100.00,
      80.00,
      ['tecnologia', 'computador', 'gamer'],
    ));
  }).toThrow(new Error('Erro: valor de compra não pode ser negativo.'));
});

test('Não deve aceitar valor de venda negativo', () => {
  expect(() => {
    Validator.abovePrice(new Product(
      144,
      'Placa mãe Asus',
      100.00,
      -80.00,
      ['tecnologia', 'computador', 'gamer'],
    ));
  }).toThrow(new Error('Erro: valor de venda não pode ser negativo.'));
});

test('Deve aceitar valor de venda && compra maior do que 0', () => {
  const product = Validator.abovePrice(new Product(
    144,
    'Placa Mãe Asus',
    50.00,
    80.00,
    ['tecnologia', 'computador', 'gamer'],
  ));
  expect(product.sellPrice).toBe(80.00);
  expect(product.buyPrice).toBe(50.00);
});