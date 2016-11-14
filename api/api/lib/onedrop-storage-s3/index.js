var s3 = require('s3');
var request = require('request');

module.exports = {
  config: {
    url: '',
    bucket: '',
    namespace: '',
    region: '',
    accessKeyId: '',
    secretAccessKey: ''
  },
  path: function(track) {
    return this.config.url + '/' + this.config.namespace + '/' + track.artist.name + '/' + track.album.name + '/' + track.track_number + ' ' + track.name + '.mp3';
  },
  exists: function(track, cb) {
    var path = this.path(track);
    request(path, {
      method: 'HEAD'
    }, function (error, response, body) {
      if ('content-type' in response.headers && response.headers['content-type'] == 'audio/mpeg') {
        cb(null, path);
      } else {
        cb(null, false);
      }
    })
  },
  remove: function(track, cb) {

    var self = this;
    var key = this.config.namespace + '/' + track.artist.name + '/' + track.album.name + '/' + track.track_number + ' ' + track.name + '.mp3';

    var client = s3.createClient({
      maxAsyncS3: 20,     // this is the default
      s3RetryCount: 3,    // this is the default
      s3RetryDelay: 1000, // this is the default
      multipartUploadThreshold: 20971520, // this is the default (20 MB)
      multipartUploadSize: 15728640, // this is the default (15 MB)
      s3Options: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
        // any other options are passed to new AWS.S3()
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
      },
    });

    // var params = {
    //   s3Params: {
    //     Bucket: this.config.bucket,
    //     Delete: {
    //       Objects: [{
    //         Key: key
    //       }],
    //     }
    //   },
    // };

    var params = {
      Bucket: this.config.bucket,
      Delete: {
        Objects: [{
          Key: key
        }],
      }
    };

    var remover = client.deleteObjects(params);

    remover.on('error', function(err) {
      cb(err);
    });

    remover.on('progress', function() {
      // console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
    });

    remover.on('end', function() {
      cb();
    });

  },
  get: function() {

  },
  put: function(file, track, cb) {

    var self = this;
    var path = this.path(track);
    var key = this.config.namespace + '/' + track.artist.name + '/' + track.album.name + '/' + track.track_number + ' ' + track.name + '.mp3';

    var client = s3.createClient({
      maxAsyncS3: 20,     // this is the default
      s3RetryCount: 3,    // this is the default
      s3RetryDelay: 1000, // this is the default
      multipartUploadThreshold: 20971520, // this is the default (20 MB)
      multipartUploadSize: 15728640, // this is the default (15 MB)
      s3Options: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
        // any other options are passed to new AWS.S3()
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html#constructor-property
      },
    });

    var params = {
      localFile: file,
      s3Params: {
        Bucket: this.config.bucket,
        Key: key,
        // other options supported by putObject, except Body and ContentLength.
        // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
      },
    };

    var uploader = client.uploadFile(params);

    uploader.on('error', function(err) {
      cb(err);
    });

    uploader.on('progress', function() {
      // console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
    });

    uploader.on('end', function() {
      cb(null, path);
    });

  }
}
