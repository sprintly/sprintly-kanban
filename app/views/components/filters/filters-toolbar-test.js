import _ from 'lodash';
import {assert} from 'chai';
import React from 'react/addons';
import sinon from 'sinon';
import stubRouterContext from '../../../lib/stub-router-context';

import FiltersToolbar from './filters-toolbar';

let TestUtils = React.addons.TestUtils;

describe('Filters Toolbar', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    let props = {
      members: [],
      user: {},
      allFilters: [],
      activeFilters: [],
      productId: 1,
      velocity: 10
    };
    let Component = stubRouterContext(FiltersToolbar, props);
    this.component = TestUtils.renderIntoDocument(<Component {...props}/>);
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('setVelocity', function() {
    beforeEach(function() {
      this.VelocityActions = FiltersToolbar.__get__('VelocityActions');
      this.setVelocityStub = this.sinon.stub(this.VelocityActions, 'setVelocity');
    });

    it('triggers the setVelocity action', function() {
      this.component.refs.stub.setState({ showVelocityInput: true });
      let form = TestUtils.findRenderedDOMComponentWithTag(this.component.refs.stub, 'form');
      let input = TestUtils.findRenderedDOMComponentWithTag(this.component.refs.stub, 'input');
      let node = input.getDOMNode();
      node.value = '12';
      TestUtils.Simulate.change(node);
      TestUtils.Simulate.submit(form);
      sinon.assert.calledWith(this.setVelocityStub, 1, '12');
    });
  });
});

