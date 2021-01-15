const EXPRESS = require('express')
const ROUTER = EXPRESS.Router()

const USER = require(`../../modules/user`)
const AUTH = require(`../../modules/common/auth`)
const ERROR_HANDLER = require(`../../modules/common/errors`)

const CONTENT = 'content-type'
const JSON_TYPE = 'application/vnd.api+json'

// Route to read all users
ROUTER.get('/users'
  , AUTH.checkAuthenticated
  , function getUsers (req, res, next) {
      USER.readUsers()
        .then(function(result) {
          res.setHeader(CONTENT, JSON_TYPE)
          res.send(JSON.stringify({ data: result.rows }))
        })
    }
  , ERROR_HANDLER
)

// Route to insert a new user
ROUTER.post('/users'
  , AUTH.checkAuthenticated
  , function postUser (req, res, next) {
      USER.insertUser(req)
        .then(function (result) {
          res.setHeader(CONTENT, JSON_TYPE)
          res.status(200)
            .send(JSON.stringify({data: result.rows[0]}))
          next()
        })
        .catch(function (error) {
          next(error)
        })
    }
  , ERROR_HANDLER
)

// Route to log a user in
ROUTER.post('/users/login'
  , AUTH.authenticateUser
  , function postUserLogin (req, res, next) {
      const USER = req.user;
      const DATA = {
        public: { id: USER.id },
        private: { token: res.locals.token }
      };
      req.bodyOut = JSON.parse(JSON.stringify({ data: DATA }))
      res.setHeader(CONTENT, JSON_TYPE)
      res.status(200)
        .send(JSON.stringify(req.bodyOut))
      next()
  }
  , ERROR_HANDLER
)


// Route to log a user out
ROUTER.post('/users/logout'
  , AUTH.checkAuthenticated
  , async function postUserLogout (req, res, next) {
      await USER.revokeToken(req)
        .then(() => {
          res.setHeader(CONTENT, JSON_TYPE)
          res.status(200).send(JSON.stringify({ message: 'User logged out' }))
        })
        .catch(error => next(error))
      next()
  }
  , ERROR_HANDLER
)


// Route to update a user
ROUTER.put('/users/:userId'
  , AUTH.checkAuthenticated
  , function putUser (req, res, next) {
      USER.updateUser(req)
        .then(function(result) {
          res.setHeader(CONTENT, JSON_TYPE)
          res.status(200)
            .send(JSON.stringify({ data: result.rows[0] }))
          next()
        })
        .catch(error => next(error))
    }
  , ERROR_HANDLER
)


// Route to enable a user
ROUTER.post('/users/:userId/enable'
  , AUTH.checkAuthenticated
  , function reEnableUser (req, res, next) {
      USER.enableUser(req, res)
        .then(function(result) {
          res.setHeader(CONTENT, JSON_TYPE)
          res.status(200)
            .send(JSON.stringify({ data: result.rows[0] }))
          next()
        })
        .catch(error => next(error))
    }
  , ERROR_HANDLER
)


// Route to disable a user
ROUTER.post('/users/:userId/disable'
  , AUTH.checkAuthenticated
  , function removeUser (req, res, next) {
      USER.disableUser(req, res)
        .then(function(result) {
          res.setHeader(CONTENT, JSON_TYPE)
          res.status(200)
            .send(JSON.stringify({ data: result.rows[0] }))
          next()
        })
        .catch(error => next(error))
    }
  , ERROR_HANDLER
)

module.exports = ROUTER