var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var stubRouterContext = require('../../../lib/stub-router-context');
var sinon = require('sinon')
var FiltersSidebar = require('./filters');
var user = {
  user: { get: function() {} }
}
var filter = {
  field: 'type',
  criteria: ['story', 'task', 'test', 'defect']
};

describe('Sidebars/Filters', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.props = _.assign({
      velocity: {
        average: 5
      },
      allFilters: [{
        field: 'assigned_to',
        criteria: ['person']
      },{
        field: 'created_by',
        criteria: ['person']
      }
      ],
      activeFilters: [filter]
    }, user);
    // this.stubs = {
    //   velocityGet: this.sinon.stub(this.VelocityActions, 'getVelocity')
    // }
  })

  afterEach(function() {
    this.sinon.restore()
  })

  describe('componentDidMount', function() {
    describe('with side props', function() {
      it('is not hidden', function() {
        var props = _.assign(this.props, {side: 'right'});
        var component = TestUtils.renderIntoDocument(<FiltersSidebar {...props} />);

        var sidebar = component.refs['filters-sidebar'].getDOMNode();

        assert.isFalse(sidebar.classList.contains('hidden'));
      })
    });
    describe('without side props', function() {
      it('is hidden', function() {
        var props = _.assign(this.props, {side: undefined});
        var component = TestUtils.renderIntoDocument(<FiltersSidebar {...props} />);

        var sidebar = component.refs['filters-sidebar'].getDOMNode();

        assert.isTrue(sidebar.classList.contains('hidden'));
      })
    })
  })
});
