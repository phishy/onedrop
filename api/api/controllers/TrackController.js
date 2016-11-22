/**
 * TrackController
 *
 * @description :: Server-side logic for managing tracks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var s3 = require('../lib/onedrop-storage-s3');
 var local = require('../lib/onedrop-storage-local');
 var urlDownload = require('../lib/onedrop-download-url');
 var Promise = require('bluebird');
 var fs = require('fs');
 var os = require('os');
 var elasticsearch = require('elasticsearch');

 function chooseStorageAdapter(setting) {
   var adapter;
   if (!setting) {
     return local;
   }
   switch (setting.adapter) {
     case 'local':
       adapter = local;
       adapter.config = setting[setting.adapter];
       break;
     case 's3':
       adapter = s3;
       adapter.config = setting[setting.adapter];
       break;
     default:
       adapter = local;
       adapter.config = setting[setting.adapter];
   }
   return adapter;
 }

 function chooseDownloadAdapter(setting) {
   return null;
 }

module.exports = {
  search: function(req, res) {
    var client = new elasticsearch.Client({
      host: 'elastic:9200'
    });
    client.search({
      q: req.query.q,
      from: req.query.from,
      size: req.query.size
    }).then(function (body) {
      var hits = body.hits.hits;
      res.ok(hits);
    }, function (err) {
      res.serverError(err);
    });
  },
  fetch: function(req, res) {

    Promise.all([
      Setting.findOne({ type: 'storage', user: req.token }),
      Setting.findOne({ type: 'global-storage' })
    ]).then(function(all){

      var config = {
        storage: all[0],
        globalStorage: all[1]
      };

      if (config.globalStorage) {
        storage = chooseStorageAdapter(config.globalStorage);
      } else {
        storage = chooseStorageAdapter(config.storage);
      }

      var path = storage.config.path + '/' + req.params[0];
      var stream = fs.createReadStream(path);
      stream.pipe(res);

    });
  },
  remove: function(req, res) {
    Promise.all([
      Setting.findOne({ type: 'storage', user: req.token }),
      Setting.findOne({ type: 'global-storage' })
    ]).then(function(all){

      var config = {
        storage: all[0],
        globalStorage: all[1]
      };

      if (config.globalStorage) {
        storage = chooseStorageAdapter(config.globalStorage);
      } else {
        storage = chooseStorageAdapter(config.storage);
      }

      if (storage.config.type == 's3') {
        storage.config.namespace = 'users/' + req.token;
      }

      var track = req.body;

      storage.remove(track, function(err){
        if (err) res.serverError(err);
        Track.destroy({ id: track.id }).then(function(){
          res.ok();
        }).catch(function(err){
          res.serverError(err);
        });
      });

    });
  },
  /**
   * Downloads, stores, scrobbles, adds to library, and responds
   */
  play: function(req, res) {

    var track = req.body;
    console.log(track);

    Promise.all([
      Setting.findOne({ type: 'storage', user: req.token }),
      Setting.findOne({ type: 'global-storage' }),
      Setting.findOne({ type: 'download', user: req.token }),
      Setting.findOne({ type: 'global-download' })
    ]).then(function(all){

      var config = {
        storage: all[0],
        globalStorage: all[1],
        download: all[2],
        globalDownload: all[3]
      };

      if ('url' in track && track.url) {
        downloader = urlDownload;
      } else if (config.globalDownload) {
        downloader = chooseDownloadAdapter(config.globalDownload);
      } else {
        downloader = chooseDownloadAdapter(config.download);
      }

      if (config.globalStorage) {
        storage = chooseStorageAdapter(config.globalStorage);
      } else {
        storage = chooseStorageAdapter(config.storage);
      }

      if (storage.config.type == 's3') {
        storage.config.namespace = 'users/' + req.token;
      }

      proceed();

    });

    function proceed() {

      storage.exists(track, function(err, path){

        if (path) return res.ok(path);

        downloader.download(track, function(err, file){
          if (err) {
            return res.notFound(err);
          }
          storage.put(file, track, function(err, file){
            if (err) {
              return res.serverError(err);
            }
            track.downloaded = 0;
            var scrobble = track;
            scrobble.user = req.token;
            delete scrobble.id;
            Track.create(track).then(function(){
              return Play.create(scrobble);
            }).then(function(){
              res.ok(file);
            });
          });
        });
      });
    }


  }
};
