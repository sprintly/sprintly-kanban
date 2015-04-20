var assert = require('chai').assert;
var sinon = require('sinon');
var SearchActions = require('./search-actions');
var Promise = require('bluebird');

describe('SearchActions', function() {

  beforeEach(function() {
    this.searchClient = SearchActions.__get__('client');
    this.appDispatcher = SearchActions.__get__('AppDispatcher');
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('search', function() {
    beforeEach(function() {
      this.success = new Promise(function(resolve) {
        resolve('results');
      });
      this.failure = new Promise(function(resolve, reject) {
        reject()
      });
      this.searchStub = this.sinon.stub(this.searchClient, 'search')
    });

    context('extra attirbutes', function() {
      beforeEach(function() {
        this.searchStub.returns(this.success);
      });

      it('adds a sort attribute to the query', function() {
        SearchActions.search('foo', 'last_modified');
        var args = this.searchStub.getCall(0).args[0];
        assert.equal(args.qs.sort, 'last_modified');
      });

      it('adds an order attribute to the query', function() {
        SearchActions.search('foo', 'last_modified', 'asc');
        var args = this.searchStub.getCall(0).args[0];
        assert.equal(args.qs.order, 'asc');
      });
    });

    context('api success', function() {

      it('dispatches a SEARCH_START event', function(done) {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.searchStub.returns(this.success);
        SearchActions.search('foo');
        setTimeout(function(){
          sinon.assert.calledWith(dispatchStub, {
            actionType: 'SEARCH_START',
            query: 'foo'
          });
          done()
        }, 0);
      });

      it('dispatches a SEARCH_SUCCESS event', function(done) {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.searchStub.returns(this.success);
        SearchActions.search('foo');
        setTimeout(function(){
          sinon.assert.calledWith(dispatchStub, {
            actionType: 'SEARCH_SUCCESS',
            payload: 'results'
          });
          done()
        }, 0);
      });
    });

    context('api error', function() {
      it('dispatches a SEARCH event', function(done) {
        var dispatchStub = this.sinon.stub(this.appDispatcher, 'dispatch');
        this.searchStub.returns(this.failure);
        SearchActions.search('foo');
        setTimeout(function(){
          sinon.assert.calledWith(dispatchStub, {
            actionType: 'SEARCH_ERROR'
          });
          done()
        }, 0);
      });
    });

  });

});
