const DB = require('./common/db_pool')
const SCHEMA = process.env.SCHEMA
const BCRYPT = require('bcrypt')

function encrypt (text) {
  return BCRYPT.hashSync(text, 14)
}

function readUsers() {
  return DB.sQL(`
    SELECT 
      id, 
      name, 
      email, 
      telephone_number as "phone", 
      enabled_flag as "enabled" 
    FROM ${SCHEMA}.users`, 
    []
  )
}

async function insertUser(req) {
  const { id, name, email, password, phone, enabled } = req.body.data

  // Validate email domain
  if ('email' in req.body) {
    const at = req.body.email.indexOf('@')
    const domain = (at !== -1) ? req.body.email.substr(at + 1) : ''
    await DB.sQL(`
      WITH setup AS (SELECT COALESCE(email_domains, array[]::varchar[]) AS edoms FROM ${SCHEMA}.application_setup)
      SELECT(SELECT array_ndims(edoms) FROM setup) is null OR $1 = any(SELECT unnest(edoms) FROM setup) as "checkDom"`, 
      [domain]
    ).then(result => {
      if (!result.rows[0].checkDom) {
        return Promise.reject({ message: 'Supplied email not in a valid domain' })
      }
    })
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
    WITH new_id AS (SELECT COALESCE($6, gen_random_uuid()) as val)
    INSERT INTO ${SCHEMA}.users (
      id,
      name,
      email,
      password,
      telephone_number,
      enabled_flag
    ) 
    VALUES ((SELECT val FROM new_id), $1, $2, $3, $4, $5)
    RETURNING
      id,
      name,
      email,
      password,
      telephone_number as "phone",
      enabled_flag as "enabled"
    `,
    [name, email, encrypt(password), phone, enabled, id]
  )
}

function getUserDetailsForToken(req) {
  return DB.sQL(`
    SELECT 
      id, 
      name, 
      email, 
      password, 
      telephone_number as "phone", 
      enabled_flag as "enabled"
    FROM ${SCHEMA}.users
    WHERE LOWER(email) = $1`,
    [req.body.data.username]
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
    `INSERT INTO ${SCHEMA}.revoked_tokens (token, revoked_on) VALUES ($1, localtimestamp)`, 
    [authToken]
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