const actionFromMethod = {
  'GET': 'reading',
  'PUT': 'updating',
  'POST': 'adding',
  'DELETE': 'deleting'
}

function handleErrors(err, req, res, next) {
  const METHOD = req.actualOperation || req.method
  const OBJECT = req.objectType || 'object'
  const ERRORS = [
    {
      source: {
        title: `Error ${actionFromMethod[METHOD]} ${OBJECT}`,
        detail: err.message
      }
    }
  ]

  req.bodyOut = { errors: ERRORS }

  res.setHeader('content-type', 'application/vnd.api+json.')
  res.send(JSON.stringify(req.bodyOut))

  next()
}

module.exports = handleErrors