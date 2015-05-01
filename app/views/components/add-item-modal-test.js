var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var sinon = require('sinon');
var stubRouterContext = require('../../lib/stub-router-context');
var AddItemModal = require('./add-item-modal');

var Modal = require('react-bootstrap').Modal;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;

var MentionsInput = require('react-mentions').MentionsInput;
var Mention = require('react-mentions').Mention;

var Title = require('./add-item/title');
var TagsInput = require('./tags-input');

var StoryTitle = require('./add-item/story-title');
var MembersDropdown = require('./add-item/members-dropdown');

var ItemActions = require('../../actions/item-actions');

describe('Add Item Modal', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.ItemActions = AddItemModal.__get__('ItemActions');
    this.addItemStub = this.sinon.stub(this.ItemActions, 'addItem').returns({then: function(){}});
    this.dismissSpy = sinon.spy();
    let props = {
      members: [
      {
        first_name: 'Sarah',
        last_name: 'Morrow',
        id: 123
      },
      {
        first_name: 'Paul',
        last_name: 'Johnson',
        id: 321
      }],
      tags: [{ tag: 'a' },{ tag: 'b' }],
      product: {
        id: '1'
      },
      onRequestHide: this.dismissSpy
    }

    let Component = stubRouterContext(AddItemModal, props);

    this.component = TestUtils.renderIntoDocument(<Component />);
  });

  afterEach(function() {
    this.sinon.restore();
  });

  context('componentDidMount', function() {
    it('renders the modal component', function () {
      assert.isDefined(TestUtils.findRenderedComponentWithType(this.component, Modal));
    });

    it('renders a NavItem for the 4 issue types', function () {
      let NavItems = TestUtils.scryRenderedComponentsWithType(this.component, NavItem);

      assert.lengthOf(NavItems, 4);
    });

    it('makes the \'type\' in state, the active NavItem', function () {
      this.component.refs.stub.setState({
        type: 'story'
      });
      let IssueTab = TestUtils.findRenderedDOMComponentWithClass(this.component, 'add-item__nav-story').getDOMNode();

      assert.isTrue(IssueTab.classList.contains('active'));
    });

    it('renders a \'Mentions\' description component', function () {
      let MentionsComponent = TestUtils.findRenderedDOMComponentWithClass(this.component, 'react-mentions');

      assert.isDefined(MentionsComponent);
    });

    it('renders a \'Tags\' input component', function () {
      let TagsInput = TestUtils.findRenderedDOMComponentWithClass(this.component, 'tags-input');

      assert.isDefined(TagsInput);
    });

    describe('action components rendered', function () {
      it('create item button', function () {
        let CreateItem = TestUtils.findRenderedDOMComponentWithClass(this.component, 'create-item');
        assert.isDefined(CreateItem);
      });

      it('cancel item button', function () {
        let CancelItem = TestUtils.findRenderedDOMComponentWithClass(this.component, 'cancel-item');
        assert.isDefined(CancelItem);
      });

      describe('backlog checkbox', function () {
        beforeEach(function () {
          this.backlogCheckbox = TestUtils.findRenderedDOMComponentWithClass(this.component, 'backlog-checkbox');
        });

        it('is present', function () {
          assert.isDefined(this.backlogCheckbox);
        });

        it('is auto selected', function () {
          assert.isTrue(this.backlogCheckbox.getDOMNode().checked);
        });
      });
    });
  });

  describe('creating a story issue type', function() {
    it('renders the StoryTitle component', function () {
      this.component.refs.stub.setState({
        type: 'story'
      });

      let StoryTitle = TestUtils.findRenderedDOMComponentWithClass(this.component, 'story-title');

      assert.isDefined(StoryTitle);
    });
  })

  describe('creating anything but a story issue type', function() {
    it('does not render the StoryTitle component', function () {
      this.component.refs.stub.setState({
        type: 'task'
      });

      let StoryTitleComponents = TestUtils.scryRenderedComponentsWithType(this.component.refs.stub, StoryTitle);

      assert.lengthOf(StoryTitleComponents,0);
    });
  });

  it('choosing an issue type updates state', function () {
    let taskLink = TestUtils.findRenderedDOMComponentWithClass(this.component, 'add-item__nav-task').getDOMNode().children[0];
    TestUtils.Simulate.click(taskLink);

    let type = this.component.refs.stub.state.type;
    assert.equal(type, 'task');
  });

  it('describing a ticket updates state', function () {
    let description = 'new feature to build';
    this.component.refs.stub.setDescription(null,'new feature to build');

    assert.equal(this.component.refs.stub.state.description, description);
  });

  it('#updateTags', function () {
    this.component.refs.stub.updateTags(['a','b']);
    let tags = this.component.refs.stub.state.tags;

    assert.sameMembers(tags, ['a','b']);
  });

  describe('member assignment', function () {
    it('#setAssignedTo', function () {
      let memberId = 123;
      let member = [{label: 'Sarah Morrow'}];

      this.component.refs.stub.setAssignedTo(memberId, member);

      assert(this.component.refs.stub.state.assignedTo, 1);
      assert(this.component.refs.stub.state.assigneeName, 'Sarah Morrow');
    });

    it('#preparesMembersForSelect', function () {
      let targetStructure = [{label: 'Sarah Morrow', value: 123},{label: 'Paul Johnson', value: 321}];
      let preparedTags = this.component.refs.stub.prepareMembersForSelect();

      assert.deepEqual(preparedTags, targetStructure);
    });


    describe('#notAssignable', function () {
      it('is true when there are no members', function () {
        let props = {
          members: [],
          tags: [{ tag: 'a' },{ tag: 'b' }],
          product: {
            id: '1'
          }
        }

        let Component = stubRouterContext(AddItemModal, props);

        let component = TestUtils.renderIntoDocument(<Component />);

        assert.ok(component.refs.stub.notAssignable());
      });
    })

    describe('#assignPlaceholder', function () {
      it('\'Unassigned\' when there are members', function () {
        assert.equal(this.component.refs.stub.assignPlaceholder(), 'Unassigned');
      });

      it('\'Nobody to assign to\' when there are no members', function () {
        let props = {
          members: [],
          tags: [{ tag: 'a' },{ tag: 'b' }],
          product: {
            id: '1'
          }
        }

        let Component = stubRouterContext(AddItemModal, props);

        let component = TestUtils.renderIntoDocument(<Component />);

        assert.equal(component.refs.stub.assignPlaceholder(), 'Nobody to assign to');
      });
    })

    describe('#assigneeName', function () {
      it('null when there is no assignee name', function () {
        this.component.refs.stub.setState({
          assigneeName: ''
        })

        assert.equal(this.component.refs.stub.assigneeName(), null);
      });

      it('Returns assignee name when there is one', function () {
        let assigneeName = 'Sarah Morrow';

        this.component.refs.stub.setState({
          assigneeName: assigneeName
        })

        assert.equal(this.component.refs.stub.assigneeName(), assigneeName);
      });
    })
  });

  context('creating an issue', function () {
    beforeEach(function () {
      this.allIssueProps = {
        title: 'title',
        description: 'build user login',
        tags: ['mvp'],
        assignedTo: '1',
        who: 'user',
        what: 'a login form',
        why: 'so that I can login'
      }

      this.component.refs.stub.setState(this.allIssueProps);
    });

    it('calls add item with form', function () {
      let CreateItemForm = TestUtils.findRenderedDOMComponentWithTag(this.component, 'form');
      TestUtils.Simulate.submit(CreateItemForm);

      sinon.assert.called(this.addItemStub);
    });

    it('creates story issue with state', function () {
      let storyIssueProps = {
        status: 'backlog',
        type: 'story',
        description: 'build user login',
        tags: ['mvp'],
        assignedTo: '1',
        who: 'user',
        what: 'a login form',
        why: 'so that I can login'
      }

      this.component.refs.stub.setState({type: 'story'});

      let CreateItemForm = TestUtils.findRenderedDOMComponentWithTag(this.component, 'form');
      TestUtils.Simulate.submit(CreateItemForm);

      assert.isTrue(this.addItemStub.calledWithExactly('1', storyIssueProps));
    });

    it('creates non-story issue with state', function () {
      let nonStoryIssueProps = {
        title: 'title',
        status: 'backlog',
        type: 'task',
        description: 'build user login',
        tags: ['mvp'],
        assignedTo: '1'
      }

      this.component.refs.stub.setState({type: 'task'});

      let CreateItemForm = TestUtils.findRenderedDOMComponentWithTag(this.component, 'form');
      TestUtils.Simulate.submit(CreateItemForm);

      assert.isTrue(this.addItemStub.calledWithExactly('1', nonStoryIssueProps));
    });
  });

  describe('dismiss modal', function () {
    it('flushes modal state', function () {
      let CloseModal = TestUtils.findRenderedDOMComponentWithClass(this.component, 'cancel-item');
      TestUtils.Simulate.click(CloseModal);

      assert.isTrue(this.dismissSpy.called);
    });
  });
});