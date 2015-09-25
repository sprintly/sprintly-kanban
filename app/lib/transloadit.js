import request from 'superagent'
import Promise from 'bluebird'

class Uploader {

  constructor(options={}) {
    this.useSSL = document.location.protocol === 'https'
    this.ready = this.getSignature()
    this.onProgress = options.onProgress || function() {}
  }

  getSignature() {
    return new Promise((resolve, reject) => {
      request.post('/transloadit').end((err, res) => {
        if (err) {
          reject(err)
        }
        this.signature = res.body.data.signature
        this.params = res.body.data.param_string

        if (this.signature && this.params) {
          resolve()
        } else {
          reject()
        }
      })
    })
  }

  checkAssemblyStatus(url, cb) {
    request.get(url)
      .accept('json')
      .end((err, res) => {
        if (res.body.ok && res.body.ok == 'ASSEMBLY_COMPLETED') {
          cb(null, res.body.results)
          return
        }

        if (res.body.ok == 'ASSEMBLY_EXECUTING') {
          this.onProgress(res.body)
        }

        if (res.body.error || (res.body.ok != 'ASSEMBLY_EXECUTING' && res.body.ok != 'ASSEMBLY_UPLOADING')) {
          cb(res.body.error)
          return
        }

        setTimeout(() => {
          this.checkAssemblyStatus(url, cb)
        }, 1000)
      })
  }

  submitUpload(file) {
    return new Promise((resolve, reject) => {
      let onComplete = (err, req) => {
        if (req.status !== 200) {
          if (req.body) {
            reject(req.body.message)
          } else {
            reject('Failed to upload file')
          }
          return
        }
        var statusUrl = this.useSSL ?
          req.body.assembly_ssl_url : req.body.assembly_url

        this.checkAssemblyStatus(statusUrl, function(err, upload) {
          if (err) {
            reject(err)
          } else {
            resolve(upload)
          }
        })
      }

      request.post('//api2.transloadit.com/assemblies?redirect=false')
        .field('file', file)
        .field('signature', this.signature)
        .field('params', this.params)
        .end(onComplete)
    })
  }

  uploadFile(file, fields) {
    return this.ready.then(() => {
      return this.submitUpload(file)
    })
  }

}

export default Uploader
