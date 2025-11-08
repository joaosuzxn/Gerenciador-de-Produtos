const express = require("express");
const { criarProduto } = require("./controladores/controladorCreateProduct")
const { deleteProduto } = require("./controladores/controladorDeleteProduct")
const {listarProdutos} = require("./controladores/controladorReadProduct")

const rotas = express();

rotas.post('/produto', criarProduto);
rotas.delete('/produto/:id', deleteProduto)
rotas.get('/produto', listarProdutos)



module.exports = rotas;