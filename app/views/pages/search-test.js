var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var stubRouterContext = require('../../lib/stub-router-context');
var sinon = require('sinon')
var assert = require('chai').assert;

var Search = require('./search');
var ProgressBar = require('../components/header');
var SearchResults = require('../components/search-results/index');
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

    describe('query present', function () {
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

      it('calls search', function() {
        sinon.assert.calledWith(this.stubs.search, 'foo');
      });

      it('renders a progress bar', function () {
        let progressBar = TestUtils.scryRenderedComponentsWithType(this.component, ProgressBar)
        assert.lengthOf(progressBar, 1);
      });
    });

    describe('query not present', function () {
      beforeEach(function () {
        let Component = stubRouterContext(Search, user, {});
        this.component = TestUtils.renderIntoDocument(<Component/>);
      });

      it('does not call the search api', function() {
        sinon.assert.notCalled(this.stubs.search);
      });

      it('renders no-results message', function () {
        this.component.refs.stub.setState({
          loading: false,
          showProgress: false,
          results: { items: [] }
        });
        let noResults = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'no-results__message')

        assert.lengthOf(noResults, 1);
      });
    })
  });

  context('query returned results', function () {
    beforeEach(function () {
      let Component = stubRouterContext(Search, user, {});
      this.component = TestUtils.renderIntoDocument(<Component/>);

      this.component.refs.stub.setState({
        loading: false,
        showProgress: false,
        results: {
          items: [{ product: { id: '1' } }],
          stories: [],
          defects: [],
          tasks: [],
          tests: []
        }
      })
    });

    it('renders a search results component', function () {
      let searchResults = TestUtils.scryRenderedComponentsWithType(this.component, SearchResults)

      assert.lengthOf(searchResults, 1);
    });
  });
})