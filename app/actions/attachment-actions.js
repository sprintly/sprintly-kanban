import AppDispatcher from '../dispatchers/app-dispatcher.js'
import TransloaditUpload from '../lib/transloadit'

let AttachmentActions = {

  createUpload(file) {

    AppDispatcher.dispatch({
      actionType: 'UPLOAD_START',
      file: file
    })

    new TransloaditUpload()
      .uploadFile(file)
      .then(function(upload) {
        AppDispatcher.dispatch({
          actionType: 'UPLOAD_COMPLETE',
          payload: upload,
          file: file
        })
      })
  },

  createAttachment() {

  }

}

export default AttachmentActions
