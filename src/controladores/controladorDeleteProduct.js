const pool = require('../conx/conx');

const deleteProduto =  async (req, res) => {
    const { id } = req.params;
    
    try{

        const resposta = await pool.query( 
            `DELETE FROM produtos WHERE id = $1`, [id]
            );

            if(resposta.rowCount === 0){
                return res.status(404).json({ message: "Produto não encontrado." });
            }

        return res.status(204).send();

    }catch(err){
        return res.status(500).json("Erro ao deletar produto (controladorDeleteProduct):", err.message);
    }
};

module.exports = {deleteProduto}