angular.module('onedrop-meta-spotify', [])

.service('Meta', function($http){

  var self = {
    url: 'https://api.spotify.com/v1'
  };

  function toArtist(data) {
    return {
      id: data.id,
      name: data.name,
      images: data.images
    }
  }

  function toAlbum(data) {
    return {
      id: data.id,
      name: data.name,
      images: data.images
    }
  }

  function toTrack(data) {
    return {
      id: data.id,
      name: data.name,
      duration: data.duration_ms,
      track_number: data.track_number,
      artist: data.artists[0],
      album: data.album
    }
  }

  this.searchArtists = function(query, cb) {
    $http.get(self.url + '/search?type=artist&q=' + query).then(function(results){
      var data = [];
      results.data.artists.items.forEach(function(artist){
        data.push(toArtist(artist));
      });
      cb(data);
    });
  }

  this.searchTracks = function(query, cb) {
    $http.get(self.url + '/search?type=track&q=' + query).then(function(res){
      var data = [];
      res.data.tracks.items.forEach(function(track){
        data.push(toTrack(track));
      });
      cb(data);
    });
  }

  this.getArtist = function(albumId, cb){
    $http.get(self.url + '/artists/' + albumId).then(function(res){
      cb(toArtist(res.data));
    });
  }

  this.getAlbums = function(albumId, cb){
    $http.get(self.url + '/artists/' + albumId + '/albums').then(function(res){
      var data = [];
      res.data.items.forEach(function(album){
        data.push(toAlbum(album));
      });
      cb(data);
    });
  }

  this.getAlbum = function(albumId, cb) {
    $http.get(self.url + '/albums/' + albumId).then(function(res){
      var data = toAlbum(res.data);
      data.artist = toArtist(res.data.artists[0])
      data.tracks = [];
      res.data.tracks.items.forEach(function(track){
        var t = toTrack(track);
        t.artist = data.artist;
        t.album = toAlbum(res.data);
        data.tracks.push(t);
      });
      cb(data);
    });
  }

  this.getTrack = function(trackId, cb) {
    $http.get('https://api.spotify.com/v1/tracks/' + item.id).then(function(res){
      cb(res.data);
    });
  }

});
