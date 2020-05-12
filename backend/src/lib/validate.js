const Ajv = require('ajv')

function makeErrorResponse(schemaErrors) {
  let errors = schemaErrors.map((error) => {
    return {
      path: error.dataPath.substr(1),
      message: error.message,
    }
  })

  return {
    status: 'failed',
    errors: errors,
  }
}

function validate(schema, source, additionalOpts = {}) {
  const ajv = new Ajv({
    allErrors: true,
    removeAdditional: 'all',
    ...additionalOpts,
  })
  const _validate = ajv.compile(schema)

  const valid = _validate(source)

  return {
    valid,
    error: makeErrorResponse(_validate.errors || []),
  }
}

module.exports = validate
