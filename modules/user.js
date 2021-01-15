const DB = require('./common/db_pool')
const SCHEMA = process.env.SCHEMA
const BCRYPT = require('bcrypt')
const VALIDATOR = require('email-validator');

function encrypt (text) {
  return BCRYPT.hashSync(text, 14)
}


// Read all users
function readUsers() {
  return DB.sQL(`
    select 
      id
    , name
    , email
    , telephone_number as "phone"
    , enabled_flag as "enabled" 
    from ${SCHEMA}.users`
    , []
  )
}

// Read details for a user
function readUser(req) {
  return DB.sQL(
    `select
        id
      , name
      , email
      , telephone_number as "phone"
      , enabled_flag as "enabled"
      from ${SCHEMA}.users
      where id = $1`
    , [req.params.userId]
  )
}

// Insert user
async function insertUser(req) {
  const { id, name, email, password, phone, enabled } = req.body.data

  // Validate email
  if ('email' in req.body.data) {
    const emailIsValid = VALIDATOR.validate(req.body.data.email);
    if (!emailIsValid) {
      return Promise.reject({
        message: 'Please enter a valid email address'
      })
    }
  }

  // Validate Password
  if ('password' in req.body.data) {
    const passwordIsStrong = checkPassword(password);
    if (!passwordIsStrong) {
      return Promise.reject({
        message: 'Your password should be at least 8 characters long with a symbol, upper and lower case letters and a number'
      })
    }
  }

  return await DB.sQL(`
    with new_id as (
      select coalesce($6, gen_random_uuid()) as val
    )
    insert into ${SCHEMA}.users (
        id
      , name
      , email
      , password
      , telephone_number
      , enabled_flag
    ) 
    values (
      (select val from new_id)
      , $1
      , $2
      , $3
      , $4
      , $5
    )
    returning 
      id
    , name
    , email
    , password
    , telephone_number as "phone"
    , enabled_flag as "enabled"`
    , [name
      , email
      , encrypt(password)
      , phone
      , enabled
      , id]
  )
}

// Update user
async function updateUser(req) {
  // Validate email domain
  if ('email' in req.body.data) {
    const emailIsValid = VALIDATOR.validate(req.body.data.email);
    if (!emailIsValid) {
      return Promise.reject({
        message: 'Please enter a valid email address'
      })
    }
  }

  await DB.sQL(
    `update ${SCHEMA}.users set
        name = coalesce($2, name)
      , email = coalesce($3, email)
      , telephone_number = coalesce($4, telephone_number)
      , enabled_flag = coalesce($5, enabled_flag)
      where id = $1`
    , [req.params.userId
      , req.body.data.name
      , req.body.data.email
      , req.body.data.phone
      , req.body.data.enabled]
  )
  return readUser(req)
}

// Enable user
async function enableUser(req) {
  await DB.sQL(
    `update ${SCHEMA}.users set
        enabled_flag = true
      where id = $1`
    , [req.params.userId]
  )
  return readUser(req)
}

// Disable user
async function disableUser(req) {
  await DB.sQL(
    `update ${SCHEMA}.users set
        enabled_flag = false
      where id = $1`
    , [req.params.userId]
  )
  return readUser(req)
}

// Function to return user details needed for web token from the database.
function getUserDetailsForToken(req) {
  return DB.sQL(`
    select 
      id
    , name
    , email
    , password
    , telephone_number as "phone"
    , enabled_flag as "enabled"
    from ${SCHEMA}.users
    where lower(email) = $1`
    , [req.body.data.username.toLowerCase()]
  )
  .then(result => {
    if (result.rows.length === 0) {
      return Promise.reject({ message: 'Invalid username or password' })
    } else {
      req.user = result.rows[0]
      return result.rows[0]
    }
  })
}

// Revoke a user's authorisation token
function revokeToken (req) {
  const authToken = req.headers.authorization.replace('Bearer ', '')
  return DB.sQL(
    `insert into ${SCHEMA}.revoked_tokens (
        token
      , revoked_on
      ) values ($1, localtimestamp)`
    , [authToken]
  );
}

// Following script for min 8 letter password, with at least a symbol, upper and lower case letters and a number
function checkPassword(password) {
  const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  return regex.test(password);
}


module.exports = { 
  readUsers,
  insertUser,
  getUserDetailsForToken,
  revokeToken,
  checkPassword,
  updateUser,
  readUser,
  enableUser,
  disableUser
}