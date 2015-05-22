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
      activeFilters: []
    };
    let Component = stubRouterContext(FiltersToolbar, props);
    this.component = TestUtils.renderIntoDocument(<Component {...props}/>);
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe.only('setVelocity', function() {
    beforeEach(function() {
      this.VelocityActions = FiltersToolbar.__get__('VelocityActions');
      this.setVelocityStub = this.sinon.stub(this.VelocityActions, 'setVelocity');
    });

    it('triggers the setVelocity action', function() {
      console.log(this.component.refs.stub.refs);
      this.component.refs.stub.setState({ showVelocityInput: true });
      let form = this.component.refs.stub.refs.velocity_form.getDOMNode();
      let input = this.component.refs.stub.refs.velocity_input.getDOMNode();
      TestUtils.Simulate.change(input, { target: { value: '12' } });
      TestUtils.Simulate.submit(form);
      assert.calledWith(this.setVelocityStub, null, '12');
    });
  });
});

