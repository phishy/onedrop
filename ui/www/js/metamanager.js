angular.module('onedrop').service('MetaManager', function(){

  this.urns = {};
  this.cache = {};

  this.resetPage = function() {
    Onedrop.meta.forEach(function(meta){
      window[meta.class].resetPage();
    });
  }

  this.search = function(q) {
    var promises = [];
    var hits = [];
    Onedrop.meta.forEach(function(meta){
      promises.push(window[meta.class].search(q).then(function(res){
        res.forEach(function(hit){
          hits.push(hit);
        });
      }));
    });
    return Promise.all(promises).then(function(){
      return hits;
    });
  }

  this.searchArtists = function(q) {
    var self = this;
    var artists = [];
    var promises = [];
    Onedrop.meta.forEach(function(meta){
      promises.push(window[meta.class].searchArtists(q).then(function(res){
        return Promise.each(res, function(artist){

          var name = artist.name.toLowerCase();

          if (!(name in self.urns)) {
            self.urns[name] = {};
            self.urns[name][meta.ns] = artist.id
          } else {
            self.urns[name][meta.ns] = artist.id
          }
          artist.urns = self.urns[name];

          // determine priority
          var e = _.find(artists, { name: artist.name });
          if (e && artist.priority < e.priority) {
            artists = _.remove(artists, function() { return artist.priority > e.priority });
            artists.push(artist);
          } else {
            artists.push(artist);
          }
          return artists;
        })
      }));
    });
    return Promise.all(promises).then(function(){
      self.cache[q] = artists;
      return artists;
    });
  }

  this.searchTracks = function(q) {
    var promises = [];
    var tracks = [];
    Onedrop.meta.forEach(function(meta){
      promises.push(window[meta.class].searchTracks(q).then(function(res){
        res.forEach(function(track){
          tracks.push(track);
        });
      }));
    });
    return Promise.all(promises).then(function(){
      return tracks;
    });
  }

  this.searchAlbums = function(q) {
    var promises = [];
    var albums = [];
    Onedrop.meta.forEach(function(meta){
      promises.push(window[meta.class].searchAlbums(q).then(function(res){
        res.forEach(function(album){
          albums.push(album);
        });
      }));
    });
    return Promise.all(promises).then(function(){
      return albums;
    });
  }

  // this.getArtist = function(id) {
  //   var self = this;
  //   var artist = null;
  //   var promises = [];
  //   Onedrop.meta.forEach(function(meta){
  //     promises.push(window[meta.class].getArtist(id).then(function(res){
  //       debugger;
  //       artist = self.toArtist(res);
  //     }));
  //   });
  //   return Promise.all(promises).then(function(){
  //     return artist;
  //   });
  // };

  this.getArtists = function(q) {
    var promises = [];
    var artists = [];
    Onedrop.meta.forEach(function(meta){
      promises.push(window[meta.class].getArtists(q).then(function(res){
        res.forEach(function(artist){
          artists.push(artist);
        });
      }));
    });
    return Promise.all(promises).then(function(){
      return artists;
    });
  }

  this.getAlbums = function(q, reset) {
    var self = this;
    var next;
    var albums = [];
    var promises = [];
    q = q.toLowerCase();
    Onedrop.meta.forEach(function(meta){
      if (!(q in self.urns) || !(meta.ns in self.urns[q])) return;
      var id = self.urns[q][meta.ns];
      promises.push(window[meta.class].getAlbums(id).then(function(res){
        return Promise.each(res, function(album){
          return albums.push(album);
        });
      }));
    });
    return Promise.all(promises).then(function(){
      return _.sortBy(albums, 'priority');
    });
  },
  this.getAlbum = function(q) {
    var pieces = q.split(':');
    var meta = _.find(Onedrop.meta, { ns: pieces[0] });
    return window[meta.class].getAlbum(pieces[1]);
  }
})
