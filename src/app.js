 
import express from 'express';
import cors from 'cors';
// import { uuid } from 'uuidv4';
import Product from './models/product'

const app = express();

app.use(express.json());
app.use(cors());

let products = [];

app.get('/products', (request, response) => response.json(products));

app.post('/products', (request, response) => {
  const { code, description, buyPrice, sellPrice, tags, id } = request.body;

  const p = products.find((v) => v.code == code);
  const lov = !p ? 0 : p.lovers;

  const product = new Product(code, description, buyPrice, sellPrice, tags, lov, id);
  
  products.push(product);
  response.status(201).json(product);
});

app.put('/products/:id', (request, response) => {
  const { id } = request.params;
  const findProduct = products.find((value) => value.id == id);

  const {
    code, description, buyPrice, sellPrice, tags,
  } = request.body;


  if (findProduct) {
    findProduct.code = code;
    findProduct.description = description;
    findProduct.buyPrice = buyPrice;
    findProduct.sellPrice = sellPrice;
    findProduct.tags = tags;
    response.status(200).send(findProduct);
  } else {
    response.status(400).send('Não existem produtos cadastrados.');
  }
});

app.delete('/products/:code', (request, response) => {
  const { code } = request.params;

  const index = products.findIndex((el) => el.code == code);

  if (index == -1) {
    response.status(400).send('Produto inexistente.');
  } else {
    products = products.filter((v) => v.code != code); response.status(204).send('Produtos com o código especificado removidos com sucesso.');
  }
});

app.get('/products/:code', (request, response) => {
  const { code } = request.params;

  const filtered = products.filter((el) => el.code == code);

  filtered == -1 ? response.status(204).send('Código de produto não encontrado.') : response.status(201).json(filtered);
});

app.post('/products/:code/love', (request, response) => {
  const { code } = request.params;

  const p = products.find((v) => v.code == code);

  if (!p) {
    response.status(400).send();
  } else {
    products.filter((v) => v.code == code).map((val) => val.lovers += 1)
    response.json({ lovers: p.lovers });
  }
});

export default app;
