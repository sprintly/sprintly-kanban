/* eslint-env mocha, node */
var assert = require('chai').assert
var helpers = require('./helpers')

describe('Component/Helpers', function() {
  it('#formatMentionMembers', function() {
    var input = [
      {
        id: '123',
        first_name: 'Some',
        last_name: 'Person'
      },
      {
        id: '999',
        first_name: 'Another',
        last_name: 'Person'
      }
    ]

    var target = [
      {
        id: 'pk:123',
        display: 'Some Person'
      },
      {
        id: 'pk:999',
        display: 'Another Person'
      }
    ]

    var result = helpers.formatMentionMembers(input)

    assert.deepEqual(result, target)
  })
})
