const { Pool } = require('pg')
const {senha} = require('./senhaBanco.js')
const pool = new Pool({
    host:'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Jj212230',
    database: 'produtos'

})

module.exports = pool