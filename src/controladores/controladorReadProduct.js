const pool = require("../conx/conx")

const listarProdutos = async (req, res) =>{
    try{
        const response = await pool.query('select * from produtos')

        return res.status(200).json(response.rows)
    }catch(err){
        return res.status(500).json(err.message)
    }




}

module.exports = {listarProdutos}
