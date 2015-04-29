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
      members: [],
      tags: [],
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

  it('adds tags to the issue', function () {
    let Tags = TestUtils.findRenderedDOMComponentWithClass(this.component, 'tags-input');
    let tagsInput = TestUtils.findRenderedDOMComponentWithClass(this.component, 'tags-input').getDOMNode().childNodes[0];
    tagsInput.value = 'mvp';

    TestUtils.Simulate.keyDown(tagsInput, {keyCode: 188});

    let tags = this.component.refs.stub.state.tags;

    assert.sameMembers(tags, ['mvp']);
  });

  it('sets assigned_to', function () {
    let assigned = 1;
    this.component.refs.stub.setAssignedTo(assigned);

    assert(this.component.refs.stub.state.assigned_to, 1);
  });

  context('creating an issue', function () {
    beforeEach(function () {
      this.allIssueProps = {
        title: 'title',
        description: 'build user login',
        tags: ['mvp'],
        assigned_to: '1',
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
        assigned_to: '1',
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
        assigned_to: '1'
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