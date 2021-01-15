const EXPRESS = require('express')
const PATH = require('path')
const BODY_PARSER = require('body-parser')
const CORS = require('cors')

const DOTENV = require('dotenv')
  .config({ path: PATH.join(__dirname, '.env' )})

const APP = EXPRESS()
const PORT = process.env.PORT !== undefined ? process.env.PORT : 3000

APP.set('port', parseInt(PORT))

APP.use(BODY_PARSER.json())
APP.use(BODY_PARSER.urlencoded({ extended: false }))

APP.use(CORS())

// Routing functions
const APIS = require('./routes/route')
APP.use(APIS)

APP.use(function (req, res, next) {
  console.log(`${req.method} request for '${req.url}'`)
  next()
})

APP.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = APP