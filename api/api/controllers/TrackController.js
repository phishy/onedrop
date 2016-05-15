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

 youtube_scraper.config = {
   path: '/tmp',
   ffmpeg: (function(){
     return (process.env.FORK) ? __dirname + '/../../../../ffmpeg_osx' : '/../../ffmpeg';
   })()
 };

module.exports = {

  /**
   * Downloads, stores, scrobbles, adds to library, and responds
   */
  play: function(req, res) {

    var track = req.body;
    console.log(track);

    var storage = local;
    var downloader = youtube_scraper;

    Setting.findOne({ type: 'storage', adapter: 's3', user: req.token }).then(function(setting){
      if (setting) {
        storage = s3;
        storage.config = setting.s3;
      }
      Setting.findOne({ type: 'download', user: req.token }).then(function(setting){
        if (setting) {
          switch (setting.adapter) {
            case 'youtube':
              downloader = youtube;
              downloader.config = setting[setting.adapter];
              break;
            case 'youtube_scraper':
              downloader = youtube_scraper;
              break;
            case 'gmusic':
              downloader = gmusic;
              // downloader.config = setting[setting.adapter];
              break;
          }
        }
        proceed();
      });
    });

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
