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

  describe('renderSprints', function() {

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
