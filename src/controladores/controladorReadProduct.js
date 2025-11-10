
const pool = require("../conx/conx");

const listarProdutos = async (req, res) => {
    
    try {
        
        const { page, search } = req.query;
    
        const limit = 10;
        const pageNum = parseInt(page, 10) || 1;
        const offset = (pageNum - 1) * limit;

        const baseProdutosQuery = `SELECT id, nome, descricao, quantidade, preco FROM produtos`;
        const baseTotalQuery = `SELECT COUNT(*) AS total_items FROM produtos`;

        let whereClause = '';
        let countParams = [];
        let produtosParams = [limit, offset]; 

        if (search) {
            const searchTerm = `%${search}%`;
            
            whereClause = ` WHERE nome ILIKE $3 OR descricao ILIKE $3 `;
            produtosParams = [limit, offset, searchTerm]; 
            
            countParams = [searchTerm]; 
        }
        
        const finalProdutosQuery = `
            ${baseProdutosQuery}
            ${whereClause}
            ORDER BY id ASC  
            LIMIT $1 
            OFFSET $2
        `;

        let finalTotalQuery = baseTotalQuery;
        if (search) {
            finalTotalQuery += ` WHERE nome ILIKE $1 OR descricao ILIKE $1 `;
        }
        
        const produtosPromise = pool.query(finalProdutosQuery, produtosParams);
        
        const totalPromise = pool.query(finalTotalQuery, countParams);

        const [produtosResult, totalResult] = await Promise.all([
            produtosPromise,
            totalPromise,
        ]);

        const totalItems = parseInt(totalResult.rows[0].total_items, 10);
        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
            data: produtosResult.rows,
            pagination: {
                currentPage: pageNum,
                pageSize: limit,
                totalItems: totalItems,
                totalPages: totalPages,
            },
        });

    } catch (err) {
        
        console.error("Erro ao listar produtos (controladorReadProduct):", err.message);
        return res.status(500).json(err.message);
    }
}

module.exports = { listarProdutos };