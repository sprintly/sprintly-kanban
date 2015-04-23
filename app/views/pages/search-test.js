var _ = require('lodash');
var assert = require('chai').assert;
var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var stubRouterContext = require('../../lib/stub-router-context');
var sinon = require('sinon')
var assert = require('chai').assert;
var Search = require('./search');
var SearchResults = require('../components/search-results/index');
var user = {
  user: { get: function() {} }
};

const NO_ITEMS = {
  items: [],
  stories: [],
  defects: [],
  tasks: [],
  tests: []
}

const STUB_PRODUCTS = {
  products: [
    {
      id: '1',
      name: 'A'
    },
    {
      id: '2',
      name: 'B'
    },
  ]
}

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
        let progressBar = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'progress-bar')
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
          results: {
            items: [],
            stories: [],
            defects: [],
            tasks: [],
            tests: []
          }
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

    it('renders a search result component', function () {
      let searchResults = TestUtils.scryRenderedComponentsWithType(this.component, SearchResults)

      assert.lengthOf(searchResults, 1);
    });

    context('filtering results', function () {
      it('does not render progressBar', function () {
        this.component.refs.stub.setState({
          loading: true,
          showProgress: false
        });

        let progressBar = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'progress-bar')

        assert.lengthOf(progressBar, 0);
      });
    })
  });

  context('search controls', function () {
    describe('non-deterministic control state', function () {

      beforeEach(function () {
        let Component = stubRouterContext(Search, user, {
          getCurrentQuery: () => { return { q: '' } }
        });
        this.component = TestUtils.renderIntoDocument(<Component/>);
      });

      describe('filter by issue type', function () {
        it('lists all issue type controls', function () {
          let issueTypes = ['story', 'defect', 'task', 'test'];

          let issueTypeButtons = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'issue-control');
          let values = _.chain(issueTypeButtons)
                              .map(function(node) {
                                return node.getDOMNode().text.toLowerCase()
                              })
                              .uniq()
                              .value();

          assert.sameMembers(values, issueTypes);
        });

        describe('selecting an issue type', function () {
          beforeEach(function () {
            this.typeControl = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'story')[0];
            TestUtils.Simulate.click(this.typeControl);
          });

          it('updates the search bar query', function () {
            let searchBar = TestUtils.findRenderedDOMComponentWithClass(this.component, 'search-bar');
            let searchQuery = searchBar.getDOMNode().value;

            assert.equal(searchQuery, 'type:story');
          });

          it('makes the selection \'active\'', function () {
            assert.isTrue(this.typeControl.getDOMNode().classList.contains('active'));
          });
        });
      });

      describe('filter by product', function () {

        describe('no products', function () {
          it('prompts the user to make a query', function () {
            this.component.refs.stub.setState({
              results: NO_ITEMS
            });

            let noResults = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'no-products__message')

            assert.lengthOf(noResults, 1);
          });
        });

        describe('with products', function () {
          beforeEach(function () {
            let results = _.extend(NO_ITEMS, STUB_PRODUCTS);
            this.component.refs.stub.setState({
              results: results
            })
          });

          it('lists all available products', function () {
            let productTypeButtons = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'product-control');
            let productNames = _.chain(productTypeButtons)
                                .map(function(node) {
                                  return node.getDOMNode().innerText
                                })
                                .value()

            assert.sameMembers(productNames, ['A','B']);
          });

          describe('selecting a product', function () {
            beforeEach(function () {
              this.productControl = TestUtils.findRenderedDOMComponentWithClass(this.component, 'product-1');
              TestUtils.Simulate.click(this.productControl);
            });

            it('updates the search bar query', function () {
              let searchBar = TestUtils.findRenderedDOMComponentWithClass(this.component, 'search-bar');
              let searchQuery = searchBar.getDOMNode().value;

              assert.equal(searchQuery, 'product:1');
            });

            it('makes the selected button \'active\'', function () {
              assert.isTrue(this.productControl.getDOMNode().classList.contains('active'));
            });
          });
        });
      });
    });

    describe('deterministic control \'active\' state', function () {

      beforeEach(function () {
        let Component = stubRouterContext(Search, user, {
          getCurrentQuery: () => { return { q: 'type:story type:defect product:1' } }
        });
        this.component = TestUtils.renderIntoDocument(<Component/>);
        let results = _.extend(NO_ITEMS, STUB_PRODUCTS);
        this.component.refs.stub.setState({
          results: results
        })
      });

      describe('query includes issue type facets', function () {
        it('included issues are active', function () {
          let storyTypeControl = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'story')[0];
          let defectTypeControl = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'defect')[0];

          assert.isTrue(storyTypeControl.getDOMNode().classList.contains('active'));
          assert.isTrue(defectTypeControl.getDOMNode().classList.contains('active'));
        })

        it('excluded issues are inactive', function () {
          let taskTypeControl = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'task')[0];

          assert.isFalse(taskTypeControl.getDOMNode().classList.contains('active'));
        })
      });

      describe('query includes product id facets', function () {
        it('included products are active', function () {
          let productControl = TestUtils.findRenderedDOMComponentWithClass(this.component, 'product-1');

          assert.isTrue(productControl.getDOMNode().classList.contains('active'));
        });

        it('excluded products are inactive', function () {
          let productControl = TestUtils.findRenderedDOMComponentWithClass(this.component, 'product-2');

          assert.isFalse(productControl.getDOMNode().classList.contains('active'));
        });
      })
    });
  });

  context('perform search', function () {

    beforeEach(function () {
      let Component = stubRouterContext(Search, user, {});
      this.component = TestUtils.renderIntoDocument(<Component/>);
      let results = _.extend(NO_ITEMS, STUB_PRODUCTS);
      this.component.refs.stub.setState({
        results: results
      });

      this.searchBar = TestUtils.findRenderedDOMComponentWithClass(this.component, 'search-bar').getDOMNode();
      this.searchBar.value = 'type:story type:defect product:1';
      TestUtils.Simulate.change(this.searchBar);

      this.form = TestUtils.findRenderedDOMComponentWithTag(this.component, 'form').getDOMNode();
      TestUtils.Simulate.submit(this.form);
    });

    describe('sets active', function () {
      it('story type control', function () {
        let storyTypeControl = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'story')[0];

        assert.isTrue(storyTypeControl.getDOMNode().classList.contains('active'));
      });

      it('product type control', function () {
        let productControl = TestUtils.findRenderedDOMComponentWithClass(this.component, 'product-1');

        assert.isTrue(productControl.getDOMNode().classList.contains('active'));
      });
    });

    describe('sets in-active', function () {
      beforeEach(function () {
        this.searchBar.value = '';
        TestUtils.Simulate.change(this.searchBar);
        TestUtils.Simulate.submit(this.form);
      });

      it('story type control', function () {
        let storyTypeControl = TestUtils.scryRenderedDOMComponentsWithClass(this.component, 'story')[0];

        assert.isFalse(storyTypeControl.getDOMNode().classList.contains('active'));
      });

      it('product type control', function () {
        let productControl = TestUtils.findRenderedDOMComponentWithClass(this.component, 'product-1');

        assert.isFalse(productControl.getDOMNode().classList.contains('active'));
      });
    })
  });

  context('search result', function () {
    beforeEach(function () {
      let Component = stubRouterContext(Search, user, {});
      this.component = TestUtils.renderIntoDocument(<Component/>);
      let story = { product: { id: '1' }, type: 'story' }
      let defect = { product: { id: '2' }, type: 'defect' }
      let task = { product: { id: '3' }, type: 'task' }
      let test = { product: { id: '4' }, type: 'test' }

      this.component.refs.stub.setState({
        results: {
          items: [ story, defect, task, test ],
          stories: [ story ],
          defects: [ defect ],
          tasks: [ task ],
          tests: [ test ]
        }
      })
    });

    it('shows the total number of issues', function () {
      let totalNode = TestUtils.findRenderedDOMComponentWithClass(this.component, 'total-issues');

      let issueTotal = _.chain(totalNode.getDOMNode().children)
                        .map(function(node) {
                          return node.textContent
                        })
                        .join(' ')
                        .value()

      assert.equal(issueTotal, "4 matching issues");
    });

    it('shows issue type breakdown', function () {
      let issueTypes = ['stories', 'defects', 'tasks', 'tests'];

      _.each(issueTypes, (type) => {
        let storyNode = TestUtils.findRenderedDOMComponentWithClass(this.component, "total-" + type);

        let storyTotal = _.chain(storyNode.getDOMNode().children)
                          .map(function(node) {
                            return node.textContent
                          })
                          .join(' ')
                          .value()

        assert.equal(storyTotal, "1 " + type);
      });
    });
  })
})