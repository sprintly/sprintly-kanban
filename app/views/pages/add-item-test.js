/* eslint-env mocha, node */
var assert = require('chai').assert
var React = require('react/addons')
var TestUtils = React.addons.TestUtils
var sinon = require('sinon')
var stubRouterContext = require('../../lib/stub-router-context')
var AddItem = require('./add-item')

var StoryTitle = require('../components/add-item/story-title')

var pagesHelpers = {
  stripeHeight: function() {
    return 0
  }
}
AddItem.__set__('pagesHelpers', pagesHelpers)

describe('Add Item', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create()
    this.ItemActions = AddItem.__get__('ItemActions')
    this.addItemStub = this.sinon.stub(this.ItemActions, 'addItem').returns({then: function(){}})
    this.ProductStore = AddItem.__get__('ProductStore')
    var mockProduct = {
      tags: [{value: 'a'}]
    }
    this.sinon.stub(this.ProductStore, 'getProduct').returns(mockProduct)

    this.dismissSpy = sinon.spy()
    let props = {
      members: [{
        first_name: 'Sarah',
        last_name: 'Morrow',
        id: 123,
        revoked: false
      }, {
        first_name: 'Paul',
        last_name: 'Johnson',
        id: 321,
        revoked: true
      }, {
        first_name: 'Ron',
        last_name: 'Wanson',
        id: 231,
        revoked: true
      }],
      tags: [{ tag: 'a' },{ tag: 'b' }],
      product: {
        id: '1'
      },
      onHide: this.dismissSpy
    }

    let Component = stubRouterContext(AddItem, props, {
      getCurrentParams: () => {
        return { id: 1 }
      },
      getCurrentPathname: () => {
        return '/product'
      }
    })

    this.component = TestUtils.renderIntoDocument(<Component />)
  })

  afterEach(function() {
    this.sinon.restore()
  })

  context('componentDidMount', function() {
    context('type selector', function() {
      it('renders a type selector', function () {
        var typeSelect = React.findDOMNode(this.component.refs.stub.refs['type-select'])
        assert.isDefined(typeSelect)
      })
    })

    it('renders a \'Mentions\' description component', function () {
      let MentionsComponent = TestUtils.findRenderedDOMComponentWithClass(this.component, 'react-mentions')

      assert.isDefined(MentionsComponent)
    })

    it('renders a \'Tags\' input component', function () {
      let TagsInput = TestUtils.findRenderedDOMComponentWithClass(this.component, 'tags-input')

      assert.isDefined(TagsInput)
    })

    describe('action components rendered', function () {
      it('create item button', function () {
        let CreateItem = TestUtils.findRenderedDOMComponentWithClass(this.component, 'create-item')
        assert.isDefined(CreateItem)
      })

      it('cancel item button', function () {
        let CancelItem = TestUtils.findRenderedDOMComponentWithClass(this.component, 'cancel-item')
        assert.isDefined(CancelItem)
      })

      describe('backlog checkbox', function () {
        beforeEach(function () {
          this.backlogCheckbox = TestUtils.findRenderedDOMComponentWithClass(this.component, 'backlog-checkbox')
        })

        it('is present', function () {
          assert.isDefined(this.backlogCheckbox)
        })

        it('is auto selected', function () {
          assert.isTrue(this.backlogCheckbox.getDOMNode().checked)
        })
      })
    })
  })

  describe('creating a story issue type', function() {
    it('renders the StoryTitle component', function () {
      this.component.refs.stub.setState({
        type: 'story'
      })

      let StoryTitle = TestUtils.findRenderedDOMComponentWithClass(this.component, 'story-title')

      assert.isDefined(StoryTitle)
    })
  })

  describe('creating anything but a story issue type', function() {
    it('does not render the StoryTitle component', function () {
      this.component.refs.stub.setState({
        type: 'task'
      })

      let StoryTitleComponents = TestUtils.scryRenderedComponentsWithType(this.component.refs.stub, StoryTitle)

      assert.lengthOf(StoryTitleComponents,0)
    })
  })

  it('describing a ticket updates state', function () {
    let description = 'new feature to build'
    this.component.refs.stub.setDescription(null,'new feature to build')

    assert.equal(this.component.refs.stub.state.description, description)
  })

  it('#updateTags', function () {
    this.component.refs.stub.updateTags(['a','b'])
    let tags = this.component.refs.stub.state.tags

    assert.sameMembers(tags, ['a','b'])
  })

  describe('member assignment', function () {
    it('#setAssignedTo', function () {
      let memberId = 123
      let member = [{label: 'Sarah Morrow'}]

      this.component.refs.stub.setAssignedTo(memberId, member)

      assert(this.component.refs.stub.state.assigned_to, 1)
      assert(this.component.refs.stub.state.assigneeName, 'Sarah Morrow')
    })

    describe('#assignPlaceholder', function () {
      it('\'Unassigned\' when there are members', function () {
        assert.equal(this.component.refs.stub.assignPlaceholder(), 'Unassigned')
      })
    })

    describe('#assigneeName', function () {
      it('null when there is no assignee name', function () {
        this.component.refs.stub.setState({
          assigneeName: ''
        })

        assert.equal(this.component.refs.stub.assigneeName(), null)
      })

      it('Returns assignee name when there is one', function () {
        let assigneeName = 'Sarah Morrow'

        this.component.refs.stub.setState({
          assigneeName: assigneeName
        })

        assert.equal(this.component.refs.stub.assigneeName(), assigneeName)
      })
    })
  })

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

      this.component.refs.stub.setState(this.allIssueProps)
    })

    describe('valid params', function () {
      it('calls add item with form', function () {
        let CreateItemButton = TestUtils.findRenderedDOMComponentWithClass(this.component, 'create-item')
        TestUtils.Simulate.click(CreateItemButton)

        sinon.assert.called(this.addItemStub)
      })

      it('creates story issue with state', function () {
        let targetAttrs = {
          status: 'backlog',
          type: 'story',
          description: 'build user login',
          tags: ['mvp'],
          assigned_to: '1',
          who: 'user',
          what: 'a login form',
          why: 'so that I can login'
        }

        this.component.refs.stub.setState({type: 'story'})

        let CreateItemButton = TestUtils.findRenderedDOMComponentWithClass(this.component, 'create-item')
        TestUtils.Simulate.click(CreateItemButton)

        assert.isTrue(this.addItemStub.calledWith('1', targetAttrs))
      })

      it('creates non-story issue with state', function () {
        let targetAttrs = {
          title: 'title',
          status: 'backlog',
          type: 'task',
          description: 'build user login',
          tags: ['mvp'],
          assigned_to: '1'
        }

        this.component.refs.stub.setState({type: 'task'})

        let CreateItemButton = TestUtils.findRenderedDOMComponentWithClass(this.component, 'create-item')
        TestUtils.Simulate.click(CreateItemButton)

        assert.isTrue(this.addItemStub.calledWithExactly('1', targetAttrs))
      })
    })
  })
})
