const express = require("express");
const { criarProduto } = require("./controladores/controladorCreateProduct")
const { deleteProduto } = require("./controladores/controladorDeleteProduct")

const rotas = express();

rotas.post('/produto', criarProduto);
rotas.delete('/produto/:id', deleteProduto)



module.exports = rotas;