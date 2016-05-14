var search = require('youtube-search');
var YoutubeMp3Downloader = require('youtube-mp3-downloader');

/**
 * Writes correct metadata to file
 *
 * @param  {[type]}   track [description]
 * @param  {[type]}   data  [description]
 * @param  {Function} cb    [description]
 * @return {[type]}         [description]
 */
function update_id3(track, filePath, cb) {

  var id3 = require('id3-writer');
  var writer = new id3.Writer();

  var file = new id3.File(filePath);
  var meta = new id3.Meta({
    artist: track.artists[0].name,
    title: track.name,
    album: track.album.name
  });

  writer.setFile(file).write(meta, function(err) {
    if (err) {
      throw new Error(err);
    }
    cb(meta, filePath);
  });
}

module.exports = {
  config: {
    maxResults: 10,
    key: ''
  },
  download: function(track, cb) {

    var self = this;

    var query = track.artist.name + ' ' + track.name + ' ' + track.album.name;

    console.log(query);
    search(query, { maxResult: this.config.maxResults, key: this.config.key }, function(err, results) {

      if (err) {
        throw new Error(err);
      }

      console.log(results);

      if (results) {
        var id = null;
        results.forEach(function(result){
          if (id) {
            return;
          }
          if (result.id) {
            id = result.id;
          }
        });

        if (!id) {
          throw new Error('could not find valid youtube id');
        }

        console.log('youtube_id:' + id);

        var YD = new YoutubeMp3Downloader({
          "ffmpegPath": self.config.ffmpeg,        // Where is the FFmpeg binary located?
          "outputPath": self.config.path,    // Where should the downloaded and encoded files be stored?
          "youtubeVideoQuality": "highest",       // What video quality should be used?
          "queueParallelism": 2,                  // How many parallel downloads/encodes should be started?
          "progressTimeout": 2000                 // How long should be the interval of the progress reports
        });

        YD.download(id, id + '.mp3');

        YD.on("error", function(error) {
          throw new Error(error);
        });

        YD.on("progress", function(progress) {
        });

        YD.on("finished", function(data) {
          cb(self.config.path + '/' + id + '.mp3');
        });

      }
    });

  }
}
