var fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = {
  config: {
    path: (function(){
      if (AppService.isDesktop) {
        return AppService.userHomePath + '/Music';
      } else {
        return __dirname + '/../../../../ui/www/music/';
      }
    })()
  },
  dir:  function(track) {
    return this.config.path + '/' + track.artist.name + '/' + track.album.name;
  },
  path: function(track) {
    return this.config.path + '/' + track.artist.name + '/' + track.album.name + '/' + track.track_number + ' ' + track.name + '.mp3';
  },
  url: function(track) {
    return '/tracks/fetch/' + track.artist.name + '/' + track.album.name + '/' + track.track_number + ' ' + track.name + '.mp3';
  },
  exists: function(track, cb) {
    var path = this.path(track);
    var url = this.url(track);
    fs.exists(path, function(exists){
      if (exists) {
        cb(null, url);
      } else {
        cb(null, false);
      }
    });
  },
  remove: function(track, cb) {
    var path = this.path(track);
    fs.unlink(path, cb);
  },
  get: function() {

  },
  put: function(file, track, cb) {
    var dir = this.dir(track);
    var path = this.path(track);
    var url = this.url(track);
    mkdirp(dir, function(err){
      if (err) {
        throw new Error(err);
      }
      fs.readFile(file, function(err, data){
        if (err) {
          throw new Error(err);
        }
        fs.writeFile(path, data, function(err){
          if (err) {
            return cb(err);
          }
          cb(null, url);
        });
      });
    });
  }
}
