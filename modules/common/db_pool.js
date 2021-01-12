const PG = require('pg')

const CONFIG = {
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT
}

const POOL = new PG.Pool(CONFIG)

module.exports = {
  sQL: function (query, params, callback) {
    return POOL.query(query, params, callback)
  }
}