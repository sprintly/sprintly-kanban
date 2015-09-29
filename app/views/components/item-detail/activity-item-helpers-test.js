/* eslint-env mocha, node */
import {assert} from 'chai'
import ActivityItemHelpers from './activity-item-helpers'

describe('ActivityItemHelpers', function() {
  describe('#attachmentDesc', function() {
    it('renders a item description', function() {
      let input = {
        type: 'attachment',
        title: 'mockups'
      }
      let target = 'An Attachment: mockups'
      let result = ActivityItemHelpers.attachmentDesc(input)

      assert.equal(result, target)
    })
  })

  describe('#activityTypeMap', function() {
    it('created', function() {
      let result = ActivityItemHelpers.activityTypeMap('item created')

      assert.equal(result, 'created this')
    })
    it('updated', function() {
      let result = ActivityItemHelpers.activityTypeMap('item changed')

      assert.equal(result, 'updated')
    })
    it('attached', function() {
      let result = ActivityItemHelpers.activityTypeMap('attachment')

      assert.equal(result, 'attached')
    })
    it('reassigned', function() {
      let result = ActivityItemHelpers.activityTypeMap('assigned')

      assert.equal(result, 'reassigned')
    })
    it('commented', function() {
      let result = ActivityItemHelpers.activityTypeMap('')

      assert.equal(result, 'commented')
    })
  })
  describe('#authorName', function() {
    it('generates the authors name', function() {
      let input = {
        first_name: 'Sarah',
        last_name: 'Sprintly'
      }
      let result = ActivityItemHelpers.authorName(input)

      assert.equal(result, 'Sarah S.')
    })
  })
  describe('#itemReassigned', function() {
    it('generates the reassignment description', function() {
      let input = {
        new: {
          first_name: 'Sarah',
          last_name: 'Sprintly'
        },
        old: {
          first_name: 'Anna',
          last_name: 'Partyline'
        }
      }

      let result = ActivityItemHelpers.itemReassigned(input)

      assert.equal(result, 'from Anna P. to Sarah S.')
    })
  })
})
