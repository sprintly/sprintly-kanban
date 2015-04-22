var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var stubRouterContext = require('../../lib/stub-router-context');
var sinon = require('sinon')
var assert = require('chai').assert;

var Search = require('./search');
var ProgressBar = require('../components/header');
var user = {
  user: { get: function() {} }
};

describe('Search ViewController', function() {
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    this.ProductActions = Search.__get__('ProductActions');
    this.ProductStore = Search.__get__('ProductStore');
    this.SearchActions = Search.__get__('SearchActions');
    this.SearchStore = Search.__get__('SearchStore');

    this.stubs = {
      productInit: this.sinon.stub(this.ProductActions, 'init'),
      productListener: this.sinon.stub(this.ProductStore, 'on'),
      search: this.sinon.stub(this.SearchActions, 'search'),
      searchListener: this.sinon.stub(this.SearchStore, 'addChangeListener')
    };
  });

  afterEach(function() {
    this.sinon.restore();
  });

  context('componentDidMount', function() {
    beforeEach(function() {
      let Component = stubRouterContext(Search, user, {
        getCurrentQuery: () => { return { q: 'foo' } }
      });
      this.component = TestUtils.renderIntoDocument(<Component/>);
    });

    it('fetches all products', function() {
      sinon.assert.called(this.stubs.productInit);
    });

    it('listens to the Product Store for changes', function() {
      sinon.assert.called(this.stubs.productListener);
    });

    it('listens to the Search Store for changes', function() {
      sinon.assert.called(this.stubs.searchListener);
    });

    describe('query present', function () {
      it('calls search', function() {
        sinon.assert.calledWith(this.stubs.search, 'foo');
      });

      it('renders a progress bar', function () {
        let progressBar = TestUtils.scryRenderedComponentsWithType(this.component, ProgressBar)
        assert.lengthOf(progressBar, 1);
      });
    });
  });

  describe('query not present', function () {
    it('does not call the search api', function() {
      this.stubs.search.reset();
      let Component = stubRouterContext(Search, user, {});
      TestUtils.renderIntoDocument(<Component/>);
      sinon.assert.notCalled(this.stubs.search);
    });

    it('renders no-results message', function () {
      let Component = stubRouterContext(Search, user, {});
      var searchComponent = TestUtils.renderIntoDocument(<Component />);
      searchComponent.refs.stub.setState({
        loading: false,
        showProgress: false,
        results: { items: [] }
      });

      let noResults = TestUtils.scryRenderedDOMComponentsWithClass(searchComponent, 'no-results__message')

      assert.lengthOf(noResults, 1);
    });
  });
});
