const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()

const USERS = require(`./routes/users.js`)

ROUTER.use('/', USERS)

module.exports = ROUTER