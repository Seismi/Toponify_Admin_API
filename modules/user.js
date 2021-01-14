const DB = require('./common/db_pool')
const SCHEMA = process.env.SCHEMA
const BCRYPT = require('bcrypt')

function encrypt (text) {
  return BCRYPT.hashSync(text, 14)
}

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

async function insertUser(req) {
  const { id, name, email, password, phone, enabled } = req.body.data

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
  checkPassword
}