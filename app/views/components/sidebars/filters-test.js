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

  describe('#issueTypesControl', function() {
    describe('active', function() {
      beforeEach(function() {
        var props = _.assign(this.props, {side: 'right'});
        this.component = TestUtils.renderIntoDocument(<FiltersSidebar {...props} />);
      })

      it('all button is active when all issue types are in active filters', function() {
        var allButton = this.component.refs['all-types'].getDOMNode();

        assert.isTrue(allButton.classList.contains('active'));
      });

      _.each(['story', 'test', 'task', 'defect'], function(type) {
        it('issue control link: '+ type + ' is active', function() {
          var refName = 'issue-link-'+type;
          var link = this.component.refs[refName].getDOMNode();

          assert.isTrue(link.classList.contains('active'));
        })
      }, this)
    })

    describe('inactive', function() {
      beforeEach(function() {
        var props = _.assign(this.props, {side: 'right'});
        this.component = TestUtils.renderIntoDocument(<FiltersSidebar {...props} />);

        var issueControl = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'issue-control')[0].getDOMNode();

        TestUtils.Simulate.click(issueControl);
        this.component.forceUpdate()
      })

      it('all button becomes inactive when issue type control is toggled', function() {
        var allButton = this.component.refs['all-types'].getDOMNode();

        assert.isFalse(allButton.classList.contains('active'))
      })

      it('all button becomes inactive when issue type control is toggled', function() {
        var storyTypeLink = this.component.refs['issue-link-story'].getDOMNode();

        assert.isFalse(storyTypeLink.classList.contains('active'))
      })
    })
  })

  describe('#mineButton', function() {
    beforeEach(function() {
      var props = _.assign(this.props, {side: 'right'});
      this.component = TestUtils.renderIntoDocument(<FiltersSidebar {...props} />);
    })

    context('mine state is active', function() {
      it('button is active', function() {
        this.component.setState({
          mine: { active: true }
        });

        var mineButton = this.component.refs['sidebar-filter-mine'].getDOMNode();

        assert.isTrue(mineButton.classList.contains('active'))
      })
    })

    context('mine state is inactive', function() {
      it('button is inactive', function() {
        this.component.setState({
          mine: { active: false }
        });

        var mineButton = this.component.refs['sidebar-filter-mine'].getDOMNode();

        assert.isFalse(mineButton.classList.contains('active'))
      })
    })
  })
});
