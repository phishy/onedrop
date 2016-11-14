var fs = require('fs');
var fetch = require('node-fetch');

module.exports = {
  config: {
    path: '/tmp'
  },
  download: function(track, cb) {
    var self = this;
    fetch(track.url).then(function(res){

      var file = self.config.path + '/' + track.id + '.mp3';
      var writeStream = fs.createWriteStream(file);
      res.body.pipe(writeStream);

      res.body.on('end', function(){
        cb(null, file);
      });

      res.body.on('error', function(err){
        cb(err);
      });
    });
  }
}
