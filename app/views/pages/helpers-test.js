/* eslint-env mocha, node */
var assert = require('chai').assert
var helpers = require('./helpers')

var EL_WIDTH = 320
var COL_COUNT = 5
var UPPER_BOUND = COL_COUNT-1
var LOWER_BOUND = 0

describe('Pages/helpers', function() {
  describe('#isMobile', function() {
    // 420 is iPhone 6+ size
    it('returns true for over 420px', function() {
      var window = {innerWidth: 419}

      assert.isTrue(helpers.isMobile(window))
    })
    it('returns false for over 420px', function() {
      var window = {innerWidth: 421}

      assert.isFalse(helpers.isMobile(window))
    })
  })
  describe('#generateTranslation', function() {
    describe('increment', function() {
      beforeEach(function() {
        this.increment = true
      })

      context('Lower Bounds', function() {
        it('return translation with increased position and value', function() {
          var target = {
            position: LOWER_BOUND+1,
            value: `-${EL_WIDTH}px`
          }

          var currentTranslation = {
            position: LOWER_BOUND,
            value: `-${EL_WIDTH*LOWER_BOUND}px`
          }

          var result = helpers.generateTranslation(currentTranslation, COL_COUNT, EL_WIDTH, this.increment)
          assert.deepEqual(result, target)
        })
      })

      context('Upper Bounds', function() {
        it('returns original position and value', function() {
          var currentTranslation = {
            position: UPPER_BOUND,
            value: `-${EL_WIDTH*UPPER_BOUND}px`
          }

          var result = helpers.generateTranslation(currentTranslation, COL_COUNT, EL_WIDTH, this.increment)
          assert.deepEqual(result, currentTranslation)
        })
      })
    })

    describe('decrement', function() {
      beforeEach(function() {
        this.increment = false
      })

      context('Lower Bounds', function() {
        it('returns original position and value', function() {
          var currentTranslation = {
            position: LOWER_BOUND,
            value: `${EL_WIDTH*LOWER_BOUND}px`
          }

          var result = helpers.generateTranslation(currentTranslation, COL_COUNT, EL_WIDTH, this.increment)
          assert.deepEqual(result, currentTranslation)
        })

        it('return translation with increased position and value', function() {
          var target = {
            position: UPPER_BOUND-1,
            value: `-${EL_WIDTH*(UPPER_BOUND-1)}px`
          }

          var currentTranslation = {
            position: UPPER_BOUND,
            value: `-${EL_WIDTH*UPPER_BOUND}px`
          }

          var result = helpers.generateTranslation(currentTranslation, COL_COUNT, EL_WIDTH, this.increment)
          assert.deepEqual(result, target)
        })
      })
    })
  })

  describe('#browserPrefix', function() {
    it('returns the prefixed version of the attr && value pair', function() {
      var target = {
        '-webkit-transform': 'translateX(-320px)',
        '-moz-transform': 'translateX(-320px)',
        '-o-transform': 'translateX(-320px)'
      }

      var result = helpers.browserPrefix('transform', 'translateX(-320px)')

      assert.deepEqual(result, target)
    })
  })
})
