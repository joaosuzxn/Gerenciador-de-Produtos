const pool = require('../conx/conx')

const criarProduto = async(req, res) =>{
    const {nome_produto, descricao, preco, quantidade} = req.body
    console.log('dados recebidos');
    console.log(nome_produto);
    
    

    if(!nome_produto){
        return res.status(400).json({message: "Insira o nome do produto."})
    }

    if(!descricao){
        return res.status(400).json({message: "Insira a descrição do produto."})
    }

    if(preco <= 0){
        return res.status(400).json({message: "Insira um preço válido."})
    }

    if(quantidade < 0){
        return res.status(400).json({message: "Insira uma quantidade válida."})
    }
    try{
        const novoProduto = await pool.query('insert into produtos (nome, descricao, preco, quantidade) values ($1, $2, $3, $4) returning id, nome, descricao', [nome_produto, descricao, preco, quantidade])
        res.status(200).json(novoProduto.rows[0])


    }catch(err){
        return res.status(500).json(err.message)
    }

}

module.exports = { criarProduto } 