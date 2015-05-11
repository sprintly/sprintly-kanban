var _ = require('lodash');
var FiltersStore = require('./filters-store');
var assert = require('chai').assert;
var Backbone = require('backdash');
var sinon = require('sinon');
var filtersJSON = require('./filters-data');

describe('FiltersStore', function() {
  before(function() {
    this.filters = FiltersStore.__get__('filters');
  });

  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('getActiveOrDefault', function() {
    it('returns all active or always visible filters', function() {
      assert.lengthOf(FiltersStore.getActiveOrDefault(), 1);
      this.filters.last().set({ active: true });
      assert.lengthOf(FiltersStore.getActiveOrDefault(), 2);
      this.filters.findWhere({ type: 'members' }).set({ alwaysVisible: true });
      assert.lengthOf(FiltersStore.getActiveOrDefault(), 3);
      this.filters.reset(filtersJSON, { silent: true });
    });
  });

  describe('getFlatObject', function() {
    it('returns the collection as a Filters object', function() {
      assert.isObject(FiltersStore.getFlatObject());
    });
  });

  describe('all', function() {
    it('returns all fitlers', function() {
      assert.lengthOf(FiltersStore.all(), 4);
    });
  });

  describe('internals', function() {

    beforeEach(function() {
      this.products = FiltersStore.__get__('products');
      this.product = this.products.add({
        id: 10001,
      });

      this.product.members = new Backbone.Collection([{ id: 2, revoked: false }]);
      this.product.tags = new Backbone.Collection([{ tag: 'foo' }]);

      this.product.members.fetch = this.product.tags.fetch = function() {
        return true;
      };

      this.user = new Backbone.Model({ id: 1 });
    });

    afterEach(function() {
      this.products.reset();
    });

    describe('init', function() {
      it('returns a promise', function() {
        this.sinon.stub(FiltersStore.internals, 'decorateMembers');
        this.sinon.stub(FiltersStore.internals, 'decorateTags');
        return FiltersStore.internals.init(this.product);
      });

      it('resets filters to their default state', function() {
        let spy = sinon.spy(this.filters, 'reset');
        FiltersStore.internals.init(this.product);
        sinon.assert.calledOnce(spy);
        spy.restore();
      });

      it('decorates members onto appropriate filters', function(done) {
        FiltersStore.internals.init(this.product).then(() => {
          let filter = this.filters.findWhere({ type: 'members' });
          let criteria = filter.get('criteriaOptions');
          assert.lengthOf(criteria[0].members, this.product.members.length);
          this.filters.reset(filtersJSON, { silent: true });
          done();
        })
      });

      it('updates the members key if it already exists', function(done) {
        FiltersStore.internals.init(this.product, this.user).then(() => {
          let filter = this.filters.findWhere({ type: 'members' });
          let criteria = filter.get('criteriaOptions');
          let criteriaSize = _.size(criteria);
          this.product.members.add({ id: 2, revoked: false });
          FiltersStore.internals.init(this.product, this.user);
          assert.lengthOf(criteria[0].members, this.product.members.length);
          assert.equal(criteriaSize, _.size(criteria));
          this.filters.reset(filtersJSON, { silent: true });
          done();
        });
      });

      it('decorates tags onto appropriate filters', function(done) {
        FiltersStore.internals.init(this.product, this.user).then(() => {
          let filter = this.filters.findWhere({ type: 'tags' });
          let criteria = filter.get('criteriaOptions');
          assert.deepEqual(criteria, this.product.tags.toJSON())
          this.filters.reset(filtersJSON, { silent: true });
          done();
        });
      });
    });

    describe('update', function() {
      it('sets active to false if unsetting the field', function() {
        FiltersStore.internals.update('type', '', true);
        let filter = this.filters.findWhere({ field: 'type' });
        assert.isFalse(filter.get('active'))
        this.filters.reset(filtersJSON, { silent: true });
      });

      it('updates a filter by field type with the supplied criteria', function() {
        FiltersStore.internals.update('type', 'story', false);
        let filter = this.filters.findWhere({ field: 'type' });
        assert.equal(filter.get('criteria'), 'story');
        this.filters.reset(filtersJSON, { silent: true });
      });
    });

  });
});
