var ODIguana = Object.assign({
  name: 'iguana',
  priority: 1,
  url: 'http://onedrop.io:1337',
  page: {
    getAlbums: {
      id: null,
      skip: 0,
      limit: 20
    }
  },
  caches: {
    artists: {},
    albums: {}
  },
  toArtist: function(data) {
    return {
      id: data.artist_id,
      priority: data.priority,
      name: data.name,
      images: [{ url: data.photo }]
    }
  },
  toAlbum: function(data) {
    var self = this;
    return {
      id: self.name + ':' + data.show_id,
      name: data.title.split(' at ')[1],
      artist: {
        id: data.artist_id
      },
      images: [{ url: null }],
      priority: data.priority
    }
  },
  toTrack: function(data) {
    return {
      id: data.track_id,
      name: data.title,
      duration: null,
      track_number: data.track,
      url: data.file,
      streamable: true,
      artist: data.artist,
      album: data.album,
    }
  },
  resetPage: function() {
    this.page = {
      getAlbums: {
        id: null,
        skip: 0,
        limit: 20
      }
    };
  },
  searchArtists: function(q) {
    var self = this;
    if (q) {
      var url = self.url + '/artists?where={"name":{"contains":"' + q + '"}}';
    } else {
      var url = self.url + '/artists?sort=name';
    }
    var artists = [];
    var opts = {
      headers: {
        accept: 'application/json',
        authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ODE3ZDg4NTllZGU2MmU0ZDExNzY5NmMiLCJpYXQiOjE0Nzg2NTkxMjd9.E_39Xcr_oVYRPZcHRqBGMnRLxyC7HSqDkYuIAccKmRs'
      }};
    return this.fetch(url, opts).then(function(res){
      res.forEach(function(artist){
        artist.priority = self.priority;
        artist = self.toArtist(artist);
        self.caches.artists[artist.id] = artist;
        artists.push(artist);
      });
      return artists;
    });
  },
  searchTracks: function(q) {
    return Promise.resolve([]);
    // var self = this;
    // var url = self.url + '/search?type=track&q=' + q;
    // return this.fetch(url).then(function(res){
    //   var data = [];
    //   res.tracks.items.forEach(function(track){
    //     data.push(self.toTrack(track));
    //   });
    //   return data;
    // });
  },
  getArtist: function(id) {
    var self = this;
    var url = self.url + '/artists?artist_id=' + id;
    var opts = {
      headers: {
        accept: 'application/json',
        authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ODE3ZDg4NTllZGU2MmU0ZDExNzY5NmMiLCJpYXQiOjE0Nzg2NTkxMjd9.E_39Xcr_oVYRPZcHRqBGMnRLxyC7HSqDkYuIAccKmRs'
      }};
    return self.fetch(url, opts).then(function(res){
      return self.toArtist(res[0]);
    });
  },
  getAlbums: function(id) {
    var self = this;
    var url = self.url + '/albums?artist_id=' + id + '&limit=' + self.page.getAlbums.limit + '&skip=' + self.page.getAlbums.skip;
    var albums = [];
    // if (self.page.getAlbums.id && !self.page.getAlbums.skip) return Promise.resolve([]);
    // url = (self.page.getAlbums.id == id) ? self.page.getAlbums.next || url : url;
    var opts = {
      headers: {
        accept: 'application/json',
        authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ODE3ZDg4NTllZGU2MmU0ZDExNzY5NmMiLCJpYXQiOjE0Nzg2NTkxMjd9.E_39Xcr_oVYRPZcHRqBGMnRLxyC7HSqDkYuIAccKmRs'
      }
    };
    return self.fetch(url, opts).then(function(res){
      self.page.getAlbums.id = id;
      self.page.getAlbums.skip += self.page.getAlbums.limit;
      res.forEach(function(album){
        album.priority = self.priority;
        album = self.toAlbum(album);
        self.caches.albums[album.id] = album;
        albums.push(album);
      });
      return albums;
    });
  },
  getAlbum: function(id) {
    var self = this;
    var url = self.url + '/albums?show_id=' + id;
    var opts = {
      headers: {
        accept: 'application/json',
        authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ODE3ZDg4NTllZGU2MmU0ZDExNzY5NmMiLCJpYXQiOjE0Nzg2NTkxMjd9.E_39Xcr_oVYRPZcHRqBGMnRLxyC7HSqDkYuIAccKmRs'
      }};
    return self.fetch(url, opts).then(function(res){
      var album = self.toAlbum(res[0]);
      return self.getArtist(album.artist.id).then(function(res){
        album.artist = res;
        album.thumb = album.images[0].url || album.artist.images[0].url;
        album.tracks = [];
        return self.fetch(self.url + '/songs?sort=track&ShowId=' + id, opts).then(function(res){
          res.forEach(function(track){
            track.artist = album.artist;
            track.album = album;
            album.tracks.push(self.toTrack(track));
          });
          return album;
        });
      });
    });
  }
}, OnedropMeta);
