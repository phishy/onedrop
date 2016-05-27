/**
 * TrackController
 *
 * @description :: Server-side logic for managing tracks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var fileExists = require('file-exists');
 var s3 = require('../lib/onedrop-storage-s3');
 var local = require('../lib/onedrop-storage-local');
 var gmusic = require('../lib/onedrop-download-gmusic');
 var youtube = require('../lib/onedrop-download-youtube');
 var youtube_scraper = require('../lib/onedrop-download-youtube-scraper');
 var Promise = require('bluebird');

 youtube_scraper.config = {
   path: '/tmp',
   ffmpeg: (function(){
     return (process.env.FORK) ? __dirname + '/../../../../ffmpeg_osx' : __dirname + '/../../ffmpeg';
   })()
 };

module.exports = {

  /**
   * Downloads, stores, scrobbles, adds to library, and responds
   */
  play: function(req, res) {

    var track = req.body;
    console.log(track);

    Promise.all([
      Setting.findOne({ type: 'storage', adapter: 's3', user: req.token }),
      Setting.findOne({ type: 'global-storage', adapter: 's3' }),
      Setting.findOne({ type: 'download', user: req.token }),
      Setting.findOne({ type: 'global-download' })
    ]).then(function(all){

      var config = {
        storage: all[0],
        globalStorage: all[1],
        download: all[2],
        globalDownload: all[3]
      };

      if (config.globalDownload) {
        downloader = chooseDownloadAdapter(config.globalDownload);
      } else {
        downloader = chooseDownloadAdapter(config.download);
      }

      if (config.globalStorage) {
        storage = chooseStorageAdapter(config.globalDownload);
      } else {
        storage = chooseStorageAdapter(config.download);
      }

      proceed();

    });

    function chooseStorageAdapter(setting) {
      var adapter;
      if (setting) {
        switch (setting.adapter) {
          case 's3':
            adapter = s3;
            adapter.config = setting[setting.adapter];
            break;
          default:
            adapter = local;
        }
      }
      return adapter;
    }

    function chooseDownloadAdapter(setting) {
      var adapter;
      if (setting) {
        switch (setting.adapter) {
          case 'youtube':
            adapter = youtube;
            adapter.config = setting[setting.adapter];
            break;
          case 'youtube_scraper':
            adapter = youtube_scraper;
            break;
          case 'gmusic':
            adapter = gmusic;
            break;
          default:
            adapter = youtube_scraper;
        }
        return adapter;
      }
    }

    function proceed() {

      storage.exists(track, function(path){

        if (path) return res.ok(path);

        downloader.download(track, function(file){
          storage.put(file, track, function(file){
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
