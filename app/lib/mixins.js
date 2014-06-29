var _ = require('lodash')

exports.attachDeps = function(params) {
  var errors = _.compact(_.map(this.dependencies, function(msg, dep) {
    if (params[dep]) {
      this[dep] = params[dep]
    } else {
      return msg
    }
  }, this))

  if (errors.length > 0) {
    throw new Error('Missing require dependencies:' + errors.join(', '))
  }
}
