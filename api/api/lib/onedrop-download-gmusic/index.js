var fetch = require('node-fetch');
var request = require('request');
var m3u = require('m3u-parser');
var fs = require('fs');

module.exports = {
  config: {
    path: ''
  },
  download: function(track, cb) {
    var self = this;
    var query = track.artist.name + ' ' + track.name + ' ' + track.album.name;

    request('http://gmusic:9999/get_by_search?type=matches&title=' + encodeURIComponent(query), {
      method: 'GET'
    }, function (err, res, body) {
      if (err) {
        console.log(body);
        throw new Error(err);
      }
      m3u.parse(body).then(function(result){
        fetch(result[0].file).then(function(res){
          var file = self.config.path + '/' + track.id + '.mp3';
          var writeStream = fs.createWriteStream(file);
          res.body.pipe(writeStream);

          res.body.on('end', function(){
            cb(file);
          });

          res.body.on('error', function(){
            cb(false);
          });
        });
      });
    })
  }
}
