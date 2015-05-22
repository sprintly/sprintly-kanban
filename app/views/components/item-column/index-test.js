import _ from 'lodash';
import {assert} from 'chai';
import React from 'react/addons';
import sinon from 'sinon';
import stubRouterContext from '../../../lib/stub-router-context';

import ItemColumn from './index';

let TestUtils = React.addons.TestUtils;

function renderComponent(props, ctx) {
  let Component = stubRouterContext(ItemColumn, props);
  return TestUtils.renderIntoDocument(<Component {...props}/>);
}

describe('Item Column', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.ProductStore = ItemColumn.__get__('ProductStore');
    this.ProductActions = ItemColumn.__get__('ProductActions');
    this.getItemsStub = this.sinon.stub(this.ProductStore, 'getItems');
    this.getItemsForProductStub = this.sinon.stub(this.ProductActions, 'getItemsForProduct');
    this.props = {
      filters: {},
      product: {},
      status: 'backlog',
      velocity: {
        average: 10
      }
    };
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('chunkItems', function() {
    beforeEach(function() {
      this.component = renderComponent(this.props, this);
    });

    context('no items', function() {
      it('returns an empty array', function() {
        let chunks = this.component.refs.stub.chunkItems();
        assert.isTrue(Array.isArray(chunks));
        assert.lengthOf(chunks, 0);
      });
    });

    context('items without a score', function() {
      beforeEach(function() {
        let items = [];
        this.unscoredItem = { score: '~' };

        _.times(5, function(i) {
          items.push({ score: 'S' });
        });
        items.push(this.unscoredItem);
        _.times(5, function(i) {
          items.push({ score: 'S' });
        });
        this.component.refs.stub.setState({items});
      });

      it('are not counted toward the total', function() {
        let chunks = this.component.refs.stub.chunkItems();
        assert.lengthOf(chunks, 1);
        assert.equal(chunks[0].points, 10);
        assert.include(chunks[0].items, this.unscoredItem);
      });
    });

    context('with single point items', function() {
      beforeEach(function() {
        let items = [];
        _.times(22, function(i) {
          items.push({ score: 'S' });
        });
        this.component.refs.stub.setState({items});
      });

      it('chunks the items by 10', function() {
        let chunks = this.component.refs.stub.chunkItems();
        assert.lengthOf(chunks, 3);
        assert.equal(chunks[0].points, 10);
        assert.equal(chunks[1].points, 10);
        assert.equal(chunks[2].points, 2);
      });
    });

    context('with a shorter item followed by a longer item', function() {
      beforeEach(function() {
        let items = [];
        items.push({ score: 'L' });
        // velocity - total underage (10 - 5 = 5) would be more than the overage
        // caused by adding the next item (13 - 10 = 3)
        items.push({ score: 'XL' });
        this.component.refs.stub.setState({items});
      });

      it('allows the chunk to go over the velocity', function() {
        let chunks = this.component.refs.stub.chunkItems();
        assert.lengthOf(chunks, 1);
        assert.equal(chunks[0].points, 13);
      });
    });

    context('with a longer item followed by a shorter item', function() {
      beforeEach(function() {
        let items = [];
        items.push({ score: 'XL' });
        // velocity - total underage (10 - 8 = 2) would less than the overage
        // caused by adding the next item (13 - 10 = 3)
        items.push({ score: 'L' });
        this.component.refs.stub.setState({items});
      });

      it('does not allow the chunk to go over the velocity', function() {
        let chunks = this.component.refs.stub.chunkItems();
        assert.lengthOf(chunks, 2);
        assert.equal(chunks[0].points, 8);
        assert.equal(chunks[1].points, 5);
      });
    });
  });

  describe('renderSprints', function() {
    context('in-progress', function() {
      beforeEach(function() {
        this.props.status = 'in-progress';
        this.component = renderComponent(this.props, this);
      });

      it('shows the item summary', function() {
        this.component.refs.stub.setState({
          sortField: 'priority',
          isLoading: false
        });
        let itemSummary = TestUtils.findRenderedDOMComponentWithClass(
          this.component.refs.stub,
          'item__summary'
        );
        assert.isDefined(itemSummary);
      });
    });

    context('not in-progress', function() {
      beforeEach(function() {
        this.props.status = 'backlog';
        this.component = renderComponent(this.props, this);
      });

      it('does not show the item summary', function() {
        this.component.refs.stub.setState({
          sortField: 'priority',
          isLoading: false
        });
        let itemSummary = TestUtils.scryRenderedDOMComponentsWithClass(
          this.component.refs.stub,
          'item__summary'
        );
        assert.lengthOf(itemSummary, 0);
      });
    });

    context('not sorted by priority', function() {
      beforeEach(function() {
        this.props.status = 'in-progress';
        this.component = renderComponent(this.props, this);
      });

      it('shows the item summary', function() {
        this.component.refs.stub.setState({
          sortField: 'last_updated',
          isLoading: false
        });
        let itemSummary = TestUtils.scryRenderedDOMComponentsWithClass(
          this.component.refs.stub,
          'item__summary'
        );
        assert.lengthOf(itemSummary, 0);
      });
    });
  });
});
