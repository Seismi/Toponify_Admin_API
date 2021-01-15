const DB = require('./db_pool')
const JWT = require('jsonwebtoken')

const USER = require('../user')
const BCRYPT = require('bcrypt')

const SCHEMA = process.env.SCHEMA
const SECRET = process.env.SECRET

// Middleware function to check authentication of user.
function checkAuthenticated (req, res, next) {
  verifyToken(req)
    .then(() => next())
    .catch(error => {
      res.status(403)
      Promise.reject({ message: 'Not Authenticated' })
      next(error)
    })
}

// Function to verify that received JSON web token is valid
function verifyToken(req) {
  return new Promise(async function (resolve, reject) {
    try {
      if (!('authorization' in req.headers)) {
        reject({ message: 'Request has no authorization header' })
      } else {
        const TOKEN = req.headers.authorization.replace('Bearer ', '')
        
        // Check that token has not been revoked
        await DB.sQL(
          `select count(*) as count
            from ${SCHEMA}.revoked_tokens
            where token = $1`
          , [TOKEN]
        ).then(function(result) {
          if (result.rows[0].count > 0) {
            reject({message: 'User has logged out of current session'})
          }
        });

        const PAYLOAD = JWT.verify(
          TOKEN, 
          SECRET, 
            {
              algorithms: ['HS512'], 
              maxAge: process.env.TIMEOUT * 60
            }
          )

        req.user = {
          id: PAYLOAD.sub,
          name: PAYLOAD.name
        }

        resolve(PAYLOAD)
      }
    }
    catch(error) {
      reject(error)
    }
  })
}

function authenticateUser(req, res, next) {
  return USER.getUserDetailsForToken(req, res)
    .then(function(user) {
      return validatePasswordAndPrivileges(user, req)
        .then(function() { return createWebToken(user, res) })
        .then(function() { next() })
    })
    .catch(function(error) {
      res.status(403)
      error.title = "Authentication failed"
      next(error)
    })
}


function validatePasswordAndPrivileges(user, req) {
  return BCRYPT.compare(req.body.data.password, user.password)
    .then(function(passed) {
      if (!passed) { 
        return Promise.reject({ message: 'Invalid username or password' })
      }
      if (!user.enabled) {
        return Promise.reject({ message: 'Insufficient privileges' })
      }
    });
}

// Function to create the JSON web token from the user details
function createWebToken(user, res) {
  const EXPIRES_ON = Date.now() + process.env.TIMEOUT * 60 * 1000

  res.locals.token = JWT.sign({
    sub: user.id, 
    name: user.name, 
    exp: Math.floor(EXPIRES_ON / 1000)
  }, SECRET, { algorithm: 'HS512' })

  res.set('X-Expires-After', (new Date(EXPIRES_ON)).toUTCString())
}


module.exports = {
  checkAuthenticated,
  authenticateUser
}