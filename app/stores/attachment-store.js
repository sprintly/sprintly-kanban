import _ from 'lodash'
import {EventEmitter} from 'events'
import AppDispatcher from '../dispatchers/app-dispatcher.js'

let pendingAttachments = []
let activeUploads = {}

let AttachmentStore = _.assign({}, EventEmitter.prototype, {
  getPendingAttachments() {
    return pendingAttachments
  },

  getActiveUploads() {
    return _.values(activeUploads)
  },

  emitChange() {
    this.emit('change')
  },

  addChangeListener(callback) {
    this.on('change', callback)
  },

  removeChangeListener(callback) {
    this.removeListener('change', callback)
  }
})


AppDispatcher.register(function(action) {
  switch (action.actionType) {
    case 'UPLOAD_START':
      activeUploads[action.file.name] = action.file
      AttachmentStore.emitChange()
      break
    case 'UPLOAD_COMPLETE':
      pendingAttachments.push(action.payload)
      delete activeUploads[action.file.name]
      AttachmentStore.emitChange()
      break
    default:
      break
  }
})

export default AttachmentStore
