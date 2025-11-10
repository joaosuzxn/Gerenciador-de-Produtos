const pool = require("../conx/conx");

const atualizarProduto = async (req, res)=>{
    
    const {nome_produto, descricao, quantidade, preco} = req.body;
    
    try{
        const { id } = req.params;
        
        
        const response = await pool.query(
            `UPDATE produtos SET nome = $1, descricao = $2, quantidade = $3, preco = $4 WHERE id = $5`, 
            [nome_produto, descricao, quantidade, preco, id] 
        );
        
        console.log(response);
         
        return res.status(201).json({"message" : "Produto atualizado"});


    }catch(err){
        
        console.error("Erro ao atualizar produto (controladorUpdateProduct):", err.message);
        return res.status(500).json(err.message);
    }

}

module.exports = { atualizarProduto }