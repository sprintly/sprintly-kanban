var _ = require('lodash');
var React = require('react/addons');
var assert = require('chai').assert;
var TestUtils = React.addons.TestUtils;
var Filter = require('../filters-toolbar-filter');
var sinon = require('sinon');

var CheckboxFilter = require('../forms/checkbox-filter');
var MembersFilter = require('../forms/members-filter');
var TagsFilter = require('../forms/tags-filter');

describe('FilterComponent', function() {
  var mockFilter;

  beforeEach(function() {
    mockFilter = {
      members: [{ id: 1, first_name: 'Some', last_name: 'User' }],
      user: { id: 2, first_name: 'Sam', last_name: 'Breed' },
      type: 'checkbox',
      field: 'type',
      label: 'Type',
      criteria: [],
      criteriaOptions: []
    };
  });

  it('renders without error', function() {
    var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
    assert.isTrue(TestUtils.isCompositeComponent(filter, Filter));
  });

  it('shows and hides filter selector form', function() {
    var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter} />);
    var node = TestUtils.findRenderedDOMComponentWithClass(filter, 'filter__label');
    TestUtils.Simulate.click(node.getDOMNode());
    var form = TestUtils.findRenderedDOMComponentWithClass(filter, 'filter__criteria-selector');
    assert.isTrue(form.getDOMNode().classList.contains('visible'));
  });

  describe('clearFilter',function() {
    it('calls updateFilters', function() {
      var stub = mockFilter.updateFilters = sinon.stub();
      var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
      var node = TestUtils.findRenderedDOMComponentWithClass(filter, 'filter__remove');
      TestUtils.Simulate.click(node.getDOMNode());
      assert.isTrue(stub.calledWith('type'));
    });

  });

  describe('renderForm', function() {
    it('renders nothing if an unexpected type is encountered', sinon.test(function() {
      mockFilter.type = 'not yet implemented';
      var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
      var [label, emptyForm] = TestUtils.scryRenderedDOMComponentsWithTag(filter, 'span');
      assert.isDefined(emptyForm);
    }));

    it('renders the expected form type', function() {
      _.each({
        members: MembersFilter,
        checkbox: CheckboxFilter,
        tags: TagsFilter
      }, function(Component, type) {
        mockFilter.type = type;
        mockFilter.criteria = '';
        var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
        var form = TestUtils.findRenderedComponentWithType(filter, Component);
        assert.isDefined(form);
      });
    });
  });

  describe('renderLabel', function() {
    describe('criteria array', function() {
      it('renders active criteria', function() {
        mockFilter.criteria = ['story', 'defect'];
        var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
        var label = TestUtils.findRenderedDOMComponentWithTag(filter, 'span');
        assert.equal(label.getDOMNode().textContent, 'story, defect');
      });

      it('renders default values', function() {
        var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
        var label = TestUtils.findRenderedDOMComponentWithTag(filter, 'span');
        assert.equal(label.getDOMNode().textContent, 'All');
      });
    });

    describe('criteria string', function() {
      it('renders active criteria', function() {
        mockFilter.criteria = 'Foo';
        var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
        var label = TestUtils.findRenderedDOMComponentWithTag(filter, 'span');
        assert.equal(label.getDOMNode().textContent, 'Foo');
      });

      it('renders default labels', function() {
        var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
        var label = TestUtils.findRenderedDOMComponentWithTag(filter, 'span');
        assert.equal(label.getDOMNode().textContent, 'All');
      });
    });

    describe('members', function() {
      it('correctly labels the current user as me', function() {
        mockFilter.type = 'members'
        mockFilter.criteria = mockFilter.user.id;
        var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
        var label = TestUtils.findRenderedDOMComponentWithTag(filter, 'span');
        assert.equal(label.getDOMNode().textContent, 'Me');
      });

      it('correctly labels unassigned', function() {
        mockFilter.type = 'members'
        mockFilter.criteria = '';
        var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
        var label = TestUtils.findRenderedDOMComponentWithTag(filter, 'span');
        assert.equal(label.getDOMNode().textContent, 'Unassigned');
      });

      it('shows the name of the active user', function() {
        mockFilter.type = 'members'
        mockFilter.criteria = 1;
        var filter = TestUtils.renderIntoDocument(<Filter {...mockFilter}/>);
        var label = TestUtils.findRenderedDOMComponentWithTag(filter, 'span');
        assert.equal(label.getDOMNode().textContent, 'Some U.');
      });
    });

  });

});
