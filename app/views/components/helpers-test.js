/* eslint-env mocha, node */
var assert = require('chai').assert
var helpers = require('./helpers')

describe('Component/Helpers', function() {
  it('#formatMentionMembers', function() {
    var input = [
      {
        id: '123',
        first_name: 'Some',
        last_name: 'Person'
      },
      {
        id: '999',
        first_name: 'Another',
        last_name: 'Person'
      }
    ]

    var target = [
      {
        id: 'pk:123',
        display: 'Some Person'
      },
      {
        id: 'pk:999',
        display: 'Another Person'
      }
    ]

    var result = helpers.formatMentionMembers(input)

    assert.deepEqual(result, target)
  })
  it('#formatTextForMarkdown', function() {
    var input = "item description http://google.com @[shane](pk:1234) for this @[sprintly](pk:9999)";
    var target = "item description [http://google.com](http://google.com) [shane](https://sprint.ly/product/1000/organizer/planning?members=1234&order=priority) for this [sprintly](https://sprint.ly/product/1000/organizer/planning?members=9999&order=priority)"

    var result = helpers.formatTextForMarkdown(input, 1000);

    assert.deepEqual(result, target);
  })
  describe('#vowelSound', function() {
    it('returns true for vowelSound', function() {
      var testWord = 'accountant';
      assert.isTrue(helpers.vowelSound(testWord));
    })
    it('returns false for non vowelSound', function() {
      var testWord = 'doctor';
      assert.isFalse(helpers.vowelSound(testWord));
    })
  })
  describe('#itemStatusMap', function() {
    it('returns \'current\' for \'in-progress\'', function() {
      var target = 'current';
      let result = helpers.itemStatusMap('in-progress')
      assert.equal(result, target);
    })
    it('returns \'done\' for \'completed\'', function() {
      var target = 'done';
      let result = helpers.itemStatusMap('completed')
      assert.equal(result, target);
    })
    it('returns \'someday\' for \'someday\'', function() {
      var target = 'someday';
      let result = helpers.itemStatusMap('someday')
      assert.equal(result, target);
    })
    it('returns \'backlog\' for \'backlog\'', function() {
      var target = 'backlog';
      let result = helpers.itemStatusMap('backlog')
      assert.equal(result, target);
    })
    it('returns \'accepted\' for \'accepted\'', function() {
      var target = 'accepted';
      let result = helpers.itemStatusMap('accepted')
      assert.equal(result, target);
    })
  })
  describe('#toTitleCase', function() {
    it('returns the title cased version of the word', function() {
      let result = helpers.toTitleCase('accepted');
      assert.equal(result, 'Accepted');
    })
  })
  describe('#formatMentionMembers', function() {
    it('formats members', function() {
      let members = [
        {
          id: 1,
          first_name: 'Bob',
          last_name: 'B'
        },
        {
          id: 2,
          first_name: 'Sarah',
          last_name: 'S'
        }
      ]
      let target = [
        {
          id: 'pk:1',
          display: 'Bob B',
        },
        {
          id: 'pk:2',
          display: 'Sarah S',
        }
      ]
      let result = helpers.formatMentionMembers(members);
      assert.deepEqual(result, target);
    })
  })
  describe('#formatForSelect', function() {
    it('formats collection', function() {
      let options = {
        bing:'bing',
        bong:'bong'
      }
      let target = [
        {
          label: 'Bing',
          value: 'bing',
        },
        {
          label: 'Bong',
          value: 'bong',
        }
      ]
      let result = helpers.formatForSelect(options);

      assert.deepEqual(result, target);
    })
  })
  describe('#formatStatusesForSelect', function() {
    it('formats status objects', function() {
      let options = {example: 'result', a: 'b'}
      let target = [
        {
          label: 'Result',
          value: 'example',
        },
        {
          label: 'B',
          value: 'a',
        }
      ]
      let result = helpers.formatStatusesForSelect(options);
      assert.deepEqual(result, target);
    })
  })
  describe('#formatSelectMembers', function() {
    it('formats a collection of unrevoked members', function() {
      let members = [
        {
          id: 1,
          revoked: true,
          first_name: 'Bob',
          last_name: 'B'
        },
        {
          id: 2,
          revoked: false,
          first_name: 'Sarah',
          last_name: 'S'
        }
      ]
      let target = [
        {
          label: 'Sarah S',
          value: 2
        }
      ]
      let result = helpers.formatSelectMembers(members);

      assert.deepEqual(result, target);
    })
  })
  describe('internals', function() {
    describe('#replaceWithContentLinks', function() {
      it('replaces links with content links', function() {
        var links = [
          'http://first-link.com',
          'http://second-link.com'
        ]
        var text = 'first http://first-link.com second http://second-link.com'
        var target = 'first [http://first-link.com](http://first-link.com) second [http://second-link.com](http://second-link.com)'

        let result = helpers.internals.replaceWithContentLinks(text, links)
        assert.equal(result, target);
      })
    })
    it('#parseNames', function() {
      var input = "something @[sarah] another @[alice]";
      var target = [
        "@[sarah]",
        "@[alice]"
      ]
      var result = helpers.internals.parseNames(input);

      assert.deepEqual(result, target)
    })
    it('#parseIds', function() {
      var input = "something (pk:123) another (pk:456)";
      var target = [
        "(pk:123)",
        "(pk:456)"
      ]
      var result = helpers.internals.parseIds(input);

      assert.deepEqual(result, target)
    })
    it('#strippedIds', function () {
      var ids = [
        "(pk:123)",
        "(pk:456)"
      ]
      var target = [
        "123",
        "456"
      ]
      var result = helpers.internals.strippedIds(ids);

      assert.deepEqual(result, target)
    })
    it('#strippedNames', function () {
      var names = [
        "@[sarah]",
        "@[alice]"
      ]
      var target = [
        "sarah",
        "alice"
      ]
      var result = helpers.internals.strippedNames(names);

      assert.deepEqual(result, target)
    })
    it('#buildContentLinks', function() {
      var links = [
        'http://first-link.com',
        'http://second-link.com'
      ]
      var target = [
        '[http://first-link.com](http://first-link.com)',
        '[http://second-link.com](http://second-link.com)'
      ]
      var result = helpers.internals.buildContentLinks(links);

      assert.deepEqual(result, target)
    })

    it('#buildMemberLinks', function() {
      var productId = 1000;
      var ids = [
        "(pk:123)",
        "(pk:456)"
      ]
      var names = [
        "@[sarah]",
        "@[alice]"
      ]
      var target = [
        "[sarah](https://sprint.ly/product/1000/organizer/planning?members=123&order=priority)",
        "[alice](https://sprint.ly/product/1000/organizer/planning?members=456&order=priority)",
      ];
      var result = helpers.internals.buildMemberLinks(ids, names, productId);

      assert.deepEqual(result, target)
    })
    it('#parseLinks', function() {
      var input = "things https://google.com https://facebook.com http://banana"
      var target = [
        "https://google.com",
        "https://facebook.com"
      ]
      var result = helpers.internals.parseLinks(input);

      assert.deepEqual(result, target)
    })
  })
})
