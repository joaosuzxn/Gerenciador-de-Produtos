const pool = require('../conx/conx')

const deleteProduto =  async (req, res) => {
    const { id } = req.params
    console.log(id);
    
    if(!id){
        return res.status(400).json({message: "insira o nome do produto"})
    }

    try{
        const response = await pool.query(
            `select * from produtos where id = $1`, [id]
        )
        if (response.rows[0]) {
            const resposta = await pool.query( //seria const resposta ou response
                'delete from produtos where id = $1', [id]
            )
            return res.status(204).send()
        }

        return res.status(404).json({"message" : "Insira um ID correspondente"})
    }catch(err){
        return res.status(500).json(err.message)
    }
}

module.exports = {deleteProduto}