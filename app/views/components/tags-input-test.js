var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var sinon = require('sinon');
var stubRouterContext = require('../../lib/stub-router-context');
var TagsInput = require('./tags-input');
var ListGroup = require('react-bootstrap').ListGroup;
var ListGroupItem = require('react-bootstrap').ListGroupItem;

const KEY_MAP = {
  backspace: 8,
  tab: 9,
  enter: 13,
  comma: 188,
  up: 38,
  down: 40,
  aKey: 65
}

describe('TagsInput', function () {
  beforeEach(function () {
    this.changeSpy = sinon.spy();

    let props = {
      tags: ['a', 'aa', 'aaa', 'b', 'c'],
      onChange: this.changeSpy
    }

    let Component = stubRouterContext(TagsInput, props);

    this.component = TestUtils.renderIntoDocument(<Component />);
  });

  describe('componentDidMount renders', function () {
    it('the component', function () {
      let tagsInput = TestUtils.findRenderedComponentWithType(this.component, TagsInput);

      assert.isDefined(tagsInput);
    });

    it('No tag labels', function () {
      let labels = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'label');

      assert.lengthOf(labels, 0);
    });

    it('tags input', function () {
      assert.isDefined(this.component.refs.stub.refs.input);
    });

    it('No tags menu', function () {
      let tagMenu = TestUtils.scryRenderedComponentsWithType(this.component, ListGroup)
      assert.lengthOf(tagMenu, 0);
    });
  });

  describe('filtered tags', function () {
    beforeEach(function () {
      this.component.refs.stub.setState({
        filteredTags: ['a' , 'aa'],
        isOpen: true
      })
    });

    it('renders a tags menu', function () {
      let tagMenu = TestUtils.scryRenderedComponentsWithType(this.component, ListGroup)
      assert.lengthOf(tagMenu, 1);
    });

    describe('ListItems', function () {
      it('renders a ListItem for each filtered item', function () {
        let listItems = TestUtils.scryRenderedComponentsWithType(this.component, ListGroupItem)
        assert.lengthOf(listItems, 2);
      });

      it('renders a List item for each result', function () {
        this.component.refs.stub.setState({
          filteredTags: ['a' , 'aa', 'aaa', 'aaaa']
        })
        let listItems = TestUtils.scryRenderedComponentsWithType(this.component, ListGroupItem)
        assert.lengthOf(listItems, 4);
      });

      it('onMouseOver of an item sets its class to focused', function () {
        let listItems = TestUtils.scryRenderedComponentsWithType(this.component, ListGroupItem);
        let chosenListItem = listItems[0];

        TestUtils.Simulate.mouseOver(chosenListItem.getDOMNode());

        assert.isTrue(chosenListItem.getDOMNode().classList.contains('tag-item__focused'));
      });

      it('renders a tag label for each prop value', function () {
        let props = {
          value: ['a' , 'aa']
        }

        let Component = stubRouterContext(TagsInput, props);
        let component = TestUtils.renderIntoDocument(<Component />);
        let label = TestUtils.scryRenderedDOMComponentsWithClass(component, 'label');

        assert.lengthOf(label, 2);
      });
    });
  });

  describe('#addTag', function () {
    beforeEach(function () {
      this.component.refs.stub.setState({
        filteredTags: ['a','b','c']
      })
      this.component.refs.stub.addTag('a');
    });

    it('resets filtered tags state', function () {
      let filteredTags = this.component.refs.stub.state.filteredTags
      assert.sameMembers(filteredTags, [])
    });

    it('resets input value', function () {
      let inputValue = this.component.refs.stub.refs.input.getDOMNode().value
      assert.equal(inputValue, '');
    });

    it('passes unique tags to parent', function () {
      assert.isTrue(this.changeSpy.calledWith(['a']));
    });
  });

  describe('#removeTag', function () {
    it('passes santized tags to parent', function () {
      let props = {
        value: ['a' , 'aa'],
        onChange: this.changeSpy
      }

      let Component = stubRouterContext(TagsInput, props);
      let component = TestUtils.renderIntoDocument(<Component />);

      component.refs.stub.removeTag('a');
      assert.isTrue(this.changeSpy.calledWith(['aa']));
    });
  });

  describe('#filterTags', function () {
    describe('without a value', function () {
      it('resets filteredTags', function () {
        this.component.refs.stub.setState({
          filteredTags: ['a','b','c']
        })

        let syntheticEvent = {target: {value: ''}};

        this.component.refs.stub.filterTags(syntheticEvent);

        let filteredTags = this.component.refs.stub.state.filteredTags
        assert.sameMembers(filteredTags, [])
      });
    });

    describe('with a value', function () {
      it('sets the fuzzy filtered results in filteredTags state', function () {
        let syntheticEvent = {target: {value: 'a'}};

        this.component.refs.stub.filterTags(syntheticEvent);

        let filteredTags = this.component.refs.stub.state.filteredTags;

        assert.sameMembers(filteredTags, ['a', 'aa', 'aaa']);
      });
    });
  });

  describe('TagInput keyboard events', function () {
    beforeEach(function () {
      this.inputNode = this.component.refs.stub.refs.input.getDOMNode();
    });

    describe('backspace', function () {
      it('removes no tags when there is an input value', function () {
        this.inputNode.value = 'abc';
        let removeSpy = sinon.spy(this.component.refs.stub, 'removeTag');

        TestUtils.Simulate.keyDown(this.inputNode, {keyCode: KEY_MAP.backspace});

        assert.isFalse(removeSpy.called);
      });

      it('removes last tag when there no input value', function () {
        let props = {
          value: ['a' , 'aa']
        }

        let Component = stubRouterContext(TagsInput, props);
        let component = TestUtils.renderIntoDocument(<Component />);
        let removeSpy = sinon.spy(component.refs.stub, 'removeTag');
        let inputNode = component.refs.stub.refs.input.getDOMNode();

        TestUtils.Simulate.keyDown(inputNode, {keyCode: KEY_MAP.backspace});

        assert.isTrue(removeSpy.calledWith('aa'));
      });
    });

    describe('tab', function () {
      it('adds input value as a tag', function () {
        this.inputNode.value = 'abc';
        let addSpy = sinon.spy(this.component.refs.stub, 'addTag');

        TestUtils.Simulate.keyDown(this.inputNode, {keyCode: KEY_MAP.tab});

        assert.isTrue(addSpy.calledWith('abc'));
      });
    });

    describe('enter', function () {
      it('sets the focused option as an tag', function () {
        this.component.refs.stub.setState({
          focusedOption: 'abc'
        })

        let addSpy = sinon.spy(this.component.refs.stub, 'addTag');

        TestUtils.Simulate.keyDown(this.inputNode, {keyCode: KEY_MAP.enter});

        assert.isTrue(addSpy.calledWith('abc'));
      });

      it('sets the input value as an tag', function () {
        this.inputNode.value = 'abc';

        let addSpy = sinon.spy(this.component.refs.stub, 'addTag');

        TestUtils.Simulate.keyDown(this.inputNode, {keyCode: KEY_MAP.enter});

        assert.isTrue(addSpy.calledWith('abc'));
      });
    });

    describe('comma', function () {
      it('adds the preceeding input as a tag', function () {
        this.inputNode.value = 'abc';

        let addSpy = sinon.spy(this.component.refs.stub, 'addTag');

        TestUtils.Simulate.keyDown(this.inputNode, {keyCode: KEY_MAP.comma});

        assert.isTrue(addSpy.calledWith('abc'));
      });
    });

    describe('nav keys', function () {
      beforeEach(function () {
        this.component.refs.stub.setState({
          filteredTags: ['a', 'b', 'c'],
          focusedOption: 'b'
        })
      });

      describe('up', function () {
        it('sets focusedOption to the previous list option', function () {
          TestUtils.Simulate.keyDown(this.inputNode, {keyCode: KEY_MAP.up});

          let focusedOption = this.component.refs.stub.state.focusedOption;

          assert.equal(focusedOption, 'a')
        });
      });

      describe('down', function () {
        it('sets focusedOption to the next list option', function () {
          TestUtils.Simulate.keyDown(this.inputNode, {keyCode: KEY_MAP.down});

          let focusedOption = this.component.refs.stub.state.focusedOption;

          assert.equal(focusedOption, 'c')
        });
      });

      it('#getFocusedOptionIndex', function () {
        let index = this.component.refs.stub.getFocusedOptionIndex();

        assert.equal(index, 1);
      });
    });

    describe('any other key', function () {
      before(function () {
        this.component.refs.stub.setState({
          focusedOption: 'focus'
        })
      });

      it('resets the focused option', function () {
        TestUtils.Simulate.keyDown(this.inputNode, {keyCode: KEY_MAP.aKey});

        let focusedOption = this.component.refs.stub.state.focusedOption;

        assert.equal(focusedOption, '')
      });
    });
  });
});