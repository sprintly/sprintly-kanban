var _ = require('lodash');
var FiltersStore = require('../filters-store');
var assert = require('chai').assert;
var Backbone = require('backdash');

describe('FiltersStore', function() {
  var filtersJSON;
  before(function() {
    this.filters = FiltersStore.__get__('filters');
  });
  beforeEach(function() {
    filtersJSON = this.filters.toJSON();
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
      this.product = {
        members: new Backbone.Collection([{ id: 2, revoked: false }]),
        tags: new Backbone.Collection([{ tag: 'foo' }])
      }

      this.product.members.fetch = this.product.tags.fetch = function() {
        return true;
      }

      this.user = new Backbone.Model({ id: 1 });
    });

    describe('init', function() {
      it('returns a promise', function() {
        return FiltersStore.internals.init(this.product, this.user);
      });

      it('decorates members onto appropriate filters', function() {
        FiltersStore.internals.init(this.product, this.user);
        let filter = this.filters.findWhere({ type: 'members' });
        let criteria = filter.get('criteriaOptions');
        assert.lengthOf(criteria[0].members, this.product.members.length);
        this.filters.reset(filtersJSON, { silent: true });
      });

      it('decorates tags onto appropriate filters', function() {
        FiltersStore.internals.init(this.product, this.user);
        let filter = this.filters.findWhere({ type: 'tags' });
        let criteria = filter.get('criteriaOptions');
        assert.deepEqual(criteria, this.product.tags.toJSON())
        this.filters.reset(filtersJSON, { silent: true });
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
