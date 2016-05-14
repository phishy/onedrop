var fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = {
  dir:  function(track) {
    return process.env.MUSIC + '/' + track.artist.name + '/' + track.album.name;
  },
  path: function(track) {
    return process.env.MUSIC + '/' + track.artist.name + '/' + track.album.name + '/' + track.track_number + ' ' + track.name + '.mp3';
  },
  url: function(track) {
    return '/music/' + track.artist.name + '/' + track.album.name + '/' + track.track_number + ' ' + track.name + '.mp3';
  },
  exists: function(track, cb) {
    var path = this.path(track);
    var url = this.url(track);
    fs.exists(path, function(exists){
      if (exists) {
        cb(url);
      } else {
        cb(false);
      }
    });
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
            throw new Error(err);
          }
          cb(url);
        });
      });
    });
  }
}
