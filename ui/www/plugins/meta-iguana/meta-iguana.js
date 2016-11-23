var ODIguana = Object.assign({
  name: 'iguana',
  priority: 1,
  url: 'http://onedrop.io:1337',
  page: {
    getAlbums: {
      id: null,
      skip: 0,
      limit: 20
    },
    searchTracks: {
      from: 0,
      size: 10,
      done: false
    },
    searchArtists: {
      from: 0,
      size: 10,
      done: false
    },
    searchAlbums: {
      from: 0,
      size: 10,
      done: false
    },
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
      },
      searchTracks: {
        from: 0,
        size: 10,
        done: false
      },
      searchArtists: {
        from: 0,
        size: 10,
        done: false
      },
      searchAlbums: {
        from: 0,
        size: 10,
        done: false
      },
    };
  },
  searchTracks: function(q) {
    var self = this;
    if (self.page.searchTracks.done) return Promise.resolve([]);
    var url = self.url + '/tracks/search?q=' + q + '&from=' + self.page.searchTracks.from + '&size=' + self.page.searchTracks.size;
    var tracks = [];
    var opts = {
      headers: {
        accept: 'application/json',
        authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ODE3ZDg4NTllZGU2MmU0ZDExNzY5NmMiLCJpYXQiOjE0Nzg2NTkxMjd9.E_39Xcr_oVYRPZcHRqBGMnRLxyC7HSqDkYuIAccKmRs'
      }};
      return this.fetch(url, opts).then(function(res){
        if (!res.length) {
          self.page.searchTracks.done = true;
          return Promise.resolve([]);
        }
        self.page.searchTracks.from += self.page.searchTracks.size;
        res.forEach(function(data){
          tracks.push({
            id: data._source.track_id,
            name: data._source.track_title,
            url: data._source.file,
            streamable: true,
            artist: {
              name: data._source.artist_name
            },
            album: {
              id: 'iguana:' + data._source.album_id,
              name: data._source.album_name
            }
          });
        });
        return tracks;
      });
    },
    searchArtists: function(q) {
      var self = this;
      if (self.page.searchTracks.done) return Promise.resolve([]);
      var url = self.url + '/artists/search?q=' + q + '&from=' + self.page.searchTracks.from + '&size=' + self.page.searchTracks.size;
      var artists = [];
      var opts = {
        headers: {
          accept: 'application/json',
          authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ODE3ZDg4NTllZGU2MmU0ZDExNzY5NmMiLCJpYXQiOjE0Nzg2NTkxMjd9.E_39Xcr_oVYRPZcHRqBGMnRLxyC7HSqDkYuIAccKmRs'
        }};
        return this.fetch(url, opts).then(function(res){
          if (!res.length) {
            self.page.searchArtists.done = true;
            return Promise.resolve([]);
          }
          self.page.searchArtists.from += self.page.searchArtists.size;
          res.forEach(function(data){
            artists.push({
              id: data._source.id,
              name: data._source.name,
              images: [ { url: data._source.photo } ]
            });
          });
          return artists;
        });
      },
      searchAlbums: function(q) {
        var self = this;
        if (self.page.searchAlbums.done) return Promise.resolve([]);
        var url = self.url + '/albums/search?q=' + q + '&from=' + self.page.searchAlbums.from + '&size=' + self.page.searchAlbums.size;
        var albums = [];
        var opts = {
          headers: {
            accept: 'application/json',
            authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1ODE3ZDg4NTllZGU2MmU0ZDExNzY5NmMiLCJpYXQiOjE0Nzg2NTkxMjd9.E_39Xcr_oVYRPZcHRqBGMnRLxyC7HSqDkYuIAccKmRs'
          }};
          return this.fetch(url, opts).then(function(res){
            if (!res.length) {
              self.page.searchAlbums.done = true;
              return Promise.resolve([]);
            }
            self.page.searchAlbums.from += self.page.searchAlbums.size;
            res.forEach(function(data){
              albums.push({
                id: 'iguana:' + data._source.album_id,
                name: data._source.album_name,
                artist: {
                  id: data._source.artist_id,
                  name: data._source.artist_name
                },
                images: [ { url: null } ]
              });
            });
            return albums;
          });
        },
  getArtists: function(q) {
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
