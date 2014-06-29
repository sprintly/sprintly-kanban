var test = require('tape')
var sinon = require('sinon')
var AppView = require('views/app')

test('AppView: initialize', function(t) {
  this.sinon = sinon.sandbox.create()

  t.plan(4)

  t.throws(
    function() { new AppView() },
    'Missing require dependencies: Products Collection',
    'enforces dependencies'
  )

  // Stubs
  var Backbone = AppView.__get__('Backbone')
  var historyStart = this.sinon.stub(Backbone.history, 'start')
  var setupColumns = this.sinon.stub(AppView.prototype, 'setupColumns')
  var User = Backbone.Model.extend({
    constructor: sinon.stub()
  })
  AppView.__set__('User', User)

  var app = new AppView({ products: new Backbone.Collection() })

  t.ok(setupColumns.called, 'calls setupColumns')
  t.ok(historyStart.called, 'starts Backbone.history')
  t.ok(User.prototype.constructor.called)

  this.sinon.restore()
});

test('AppView: setupColumns', function(t) {
  this.sinon = sinon.sandbox.create()

  t.plan(5)

  function setupContext() {
    return {
      store: {
        get: function() { return "" }
      },
      toggleSmallNav: sinon.stub(),
      listenTo: sinon.stub()
    }
  }

  var Backbone = AppView.__get__('Backbone')
  var ctx = setupContext()

  AppView.prototype.setupColumns.call(ctx)

  t.ok(ctx.config instanceof Backbone.Model)
  t.equal(ctx.config.get('columns').length, 0)
  t.ok(ctx.toggleSmallNav.called, 'sets up the nav pane')
  t.ok(ctx.listenTo.calledWith(ctx.config, 'update'), 'attaches an event listener to update')

  // Bootstrapping Column Settings from localStorage
  ctx.store.get = function(){ return "1#someday,2#backlog" }
  AppView.prototype.setupColumns.call(ctx)
  t.equal(ctx.config.get('columns').length, 2)

  this.sinon.restore()
});

test('AppView: update', function(t) {
  this.sinon = sinon.sandbox.create()

  t.plan(2)

  var Backbone = AppView.__get__('Backbone')
  var ctx = {
    toggleSmallNav: this.sinon.stub(),
    store: {
      set: this.sinon.stub()
    },
    config: new Backbone.Model({ columns: ['1#someday', '1#backlog'] })
  }

  AppView.prototype.update.call(ctx)

  t.ok(ctx.toggleSmallNav.called)
  t.ok(ctx.store.set.calledWith('cols', '1#someday,1#backlog'))

  this.sinon.restore()
})

test('AppView: toggleSmallNav', function(t) {
  this.sinon = sinon.sandbox.create()
  var Backbone = AppView.__get__('Backbone')

  t.plan(3)

  var ctx = {
    $el: {
      addClass: this.sinon.stub(),
      removeClass: this.sinon.stub()
    },
    config: new Backbone.Model({ columns: ['1#someday', '1#backlog'] })
  }

  AppView.prototype.toggleSmallNav.call(ctx)
  t.ok(ctx.$el.removeClass.called)
  t.notOk(ctx.$el.addClass.called)

  ctx.config.set('columns', [1,2,3,4])
  AppView.prototype.toggleSmallNav.call(ctx)
  t.ok(ctx.$el.addClass.called)

  this.sinon.restore()
})
