var test = require('tape')
var sinon = require('sinon')
var Backbone = require('backdash')
var React = require('react/addons')
var Items = require('views/pages/items')
var fixtures = require('../../fixtures')

var ItemColumn = require('views/components/item-column')

var TestUtils = React.addons.TestUtils

test('ItemsComponent', function(t) {
  this.sinon = sinon.sandbox.create()
  t.plan(1)

  var config = new Backbone.Model({ columns: [] })
  Items.__set__('ItemColumn', TestUtils.mockComponent(ItemColumn))

  var items = TestUtils.renderIntoDocument(
    Items({
      products: [],
      config: config
    })
  )

  var tout = TestUtils.scryRenderedDOMComponentsWithClass(items, 'tout')
  t.equal(tout.length, 1)

  var products = new Backbone.Collection([fixtures.product])
  products.first().getItemsByStatus = function(){
    return new Backbone.Collection()
  }

  config.set('columns', ['1#someday'])

  items.setProps({
    products: products
  })

  var columns = TestUtils.scryRenderedDOMComponentsWithClass(items, 'column')
  t.equal(columns.length, 1)

  this.sinon.restore()
})
