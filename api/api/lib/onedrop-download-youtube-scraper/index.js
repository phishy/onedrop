var xray = require('x-ray')();
var YoutubeMp3Downloader = require('youtube-mp3-downloader');

module.exports = {
  config: {
    ffmpeg: '',
    path: ''
  },
  download: function(track, cb) {
    var self = this;
    var query = encodeURIComponent(track.artist.name + ' ' + track.album.name + ' ' + track.name);
    xray('https://www.youtube.com/results?search_query=' + query, 'div.yt-lockup-content > h3', [{
      title: 'a',
      link: 'a@href'
    }])(function(err, items){
      items.forEach(function(item){
        item.id = item.link.replace('https://www.youtube.com/watch?v=', '');
      });
      var id = items[0].id

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

    });
  }
}
