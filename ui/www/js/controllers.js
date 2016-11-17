angular.module('onedrop')

.factory('Config', function(){

  var servedFromFile = (window.location.protocol == 'file:') ? true : false;
  var isDesktop = servedFromFile && !ionic.Platform.isWebView();

  var config = {
    api: {
      url: (function(){
        if (window.location.port) {
          return window.location.origin.split(window.location.port)[0] + '1337'
        } else {
          return window.location.origin + ':1337'
        }
      })()
    },
    desktopMusicUrl: window.location.pathname.replace('/index.html', ''),
    isDesktop: false,
    isMobile: false,
    isConfigurable: true,
  };

  if (isDesktop) {
    config.api.url = 'http://localhost:1337';
    config.isDesktop = true;
  }

  if (Onedrop.api) {
    config.api.url = Onedrop.api;
  }

  if (Onedrop.isConfigurable !== null) {
    config.isConfigurable = Onedrop.isConfigurable;
  }

  if (ionic.Platform.isWebView()) {
    config.api.url = 'http://onedrop.io:1337';
    config.isMobile = true;
    config.isConfigurable = false;
  }

  return config;
})

.service('Audio', function($http, Config, store, $ionicLoading){

  var self = this;

  this.Player = document.createElement('Audio');
  this.Player.preloadedNextTrack = document.createElement('Audio');
  this.Player.isPlaying = false;

  this.Player.addEventListener('loadstart', function(){
    $ionicLoading.show({
      template: 'Loading...'
    });
  });

  this.Player.addEventListener('playing', function(){
    $ionicLoading.hide();
  });

  this.Player.addEventListener('pause', function(){
    self.Player.isPlaying = false;
  });

  this.Player.addEventListener('ended', function(){
    self.Player.isPlaying = false;
  });

  this.Player.preloadedNextTrack.addEventListener('canplay', function(){
    self.Player.preloadedNextTrack.isReady = true;
  });

  this.Playlist = {
    _current: null,
    _playlists: {},
    add: function(opts) {
      var name = opts.name || window.location.hash;
      this._playlists[name] = { index: 0, tracks: opts.tracks };
    },
    load: function() {
      this._current = this._playlists[window.location.hash];
    },
    getNext: function() {
      if (this._current.index != this._current.tracks.length) {
        return this._current.tracks[this._current.index + 1]
      }
      return false;
    },
    next: function() {
      if (this._current.index != this._current.tracks.length) {
        ++this._current.index;
      }
      return this._current.tracks[this._current.index];
    },
    previous: function() {
      if (this._current.index != 0) {
        --this._current.index;
      }
      return this._current.tracks[this._current.index];
    },
  };

})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, cfpLoadingBar, store, Config, Audio, $cordovaFile, $timeout) {

  $scope.auth = store.get('user');
  $scope.config = Config;
  $scope.track = null;

  Audio.Player.addEventListener('ended', function(){
    trackEnded();
  });

  function trackEnded() {
    // if (Audio.Player.preloadedNextTrack.isReady) {

      // @todo refactor

      $scope.$apply(function(){
        $scope.track = Audio.Playlist.getNext();
      });

      ++Audio.Playlist._current.index;
      Audio.Player = Audio.Player.preloadedNextTrack;
      Audio.Player.play();

      Audio.Player.addEventListener('ended', function(){
        trackEnded();
      });

      Audio.Player.preloadedNextTrack = document.createElement('Audio');

      Audio.Player.preloadedNextTrack.addEventListener('canplay', function(){
        Audio.Player.preloadedNextTrack.isReady = true;
      });

      if (Audio.Playlist.getNext()) {
        preloadNextTrack();
      }

    // } else {
    //   var track = Audio.Playlist.next();
    //   if (track) $scope.play(track);
    // }
  }

  $scope.clickPlay = function(track, index) {
    Audio.Playlist.load();
    $scope.play(track, index);
  }

  $scope.play = function(track, index) {

    $scope.track = track;

    if (index != null) {
      Audio.Playlist._current.index = index;
    }

    // @todo play/pause ere due to iOS web requirement to be user-initiated
    Audio.Player.play();
    Audio.Player.pause();

    if ('streamable' in track && track.streamable) {
      Audio.Player.src = track.url;
      Audio.Player.play();
      if (Audio.Playlist.getNext()) {
        preloadNextTrack();
      }
      return;
    }

    if (Audio.Playlist.getNext()) {
      preloadNextTrack();
    }

    cfpLoadingBar.start();
    getUrlForTrack(track, function(url){
      Audio.Player.src = url;
      Audio.Player.load();
      Audio.Player.play();
      cfpLoadingBar.complete();
    });
  }

  function preloadNextTrack() {
    var next = Audio.Playlist.getNext();
    if ('streamable' in next && next.streamable) {
      Audio.Player.preloadedNextTrack.src = next.url;
      Audio.Player.preloadedNextTrack.load();
    } else {
      getUrlForTrack(Audio.Playlist.getNext(), function(url){
        Audio.Player.preloadedNextTrack.src = url;
        Audio.Player.preloadedNextTrack.load();
      });
    }
  }

  function getUrlForTrack(track, cb) {
    $http.post(Config.api.url + '/tracks/play', angular.toJson(track), {
      headers: { Authorization: 'Bearer ' + store.get('user').token }
    }).then(function(results){
      var url = (results.data[0] == '/') ? Config.api.url + results.data : results.data;
      cb(url);
    });
  }

  $scope.unpause = function() {
  	Audio.Player.play();
  }

  $scope.pause = function() {
    Audio.Player.pause();
  }

  $scope.previous = function() {
    var track = Audio.Playlist.previous();
    $scope.play(track);
  }

  $scope.next = function() {
    var track = Audio.Playlist.next();
    $scope.play(track);
  }

})

.controller('WelcomeCtrl', function() {

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('SettingsCtrl', function() {
})

.controller('GlobalDownloadCtrl', function($scope, $stateParams, $state, Restangular, Audio, Config) {

  $scope.data = {
    type: 'global-download',
    adapter: ''
  }

  Restangular.all('settings').getList({ type: 'global-download' }).then(function(res){
    if (res.length) {
      $scope.data = res[0];
    }
  });

  $scope.save = function() {
    if ('id' in $scope.data) {
      $scope.data.put().then(function(){
        $state.go('app.settings');
      });
    } else {
      Restangular.all('settings').post($scope.data).then(function(res){
        $state.go('app.settings');
      });
    }
  }

})

.controller('DownloadCtrl', function($scope, $stateParams, $state, Restangular, Audio, Config) {

  $scope.data = {
    type: 'download',
    adapter: ''
  }

  Restangular.all('settings').getList({ type: 'download' }).then(function(res){
    if (res.length) {
      $scope.data = res[0];
    }
  });

  $scope.save = function() {
    if ('id' in $scope.data) {
      $scope.data.put().then(function(){
        $state.go('app.settings');
      });
    } else {
      Restangular.all('settings').post($scope.data).then(function(res){
        $state.go('app.settings');
      });
    }
  }

})

.controller('GlobalStorageCtrl', function($scope, $stateParams, $state, Restangular, Audio, Config) {

  $scope.data = {
    type: 'global-storage',
    adapter: 'local',
    local: {
      type: 'local',
    },
    s3: {
      type: 's3',
      url: '',
      region: '',
      bucket: '',
      accessKeyId: '',
      secretAccessKey: ''
    }
  };

  Restangular.all('settings').getList({ type: 'global-storage' }).then(function(res){
    if (res.length) {
      $scope.data = res[0];
    }
  });

  $scope.save = function() {
    // strip trailing slash
    if ($scope.data.s3.url[$scope.data.s3.url.length-1] == '/') {
      $scope.data.s3.url = $scope.data.s3.url.substring(0, name.length-1);
    }
    if ('id' in $scope.data) {
      $scope.data.put().then(function(){
        $state.go('app.settings');
      });
    } else {
      Restangular.all('settings').post($scope.data).then(function(res){
        $state.go('app.settings');
      });
    }
  }

})

.controller('StorageCtrl', function($scope, $stateParams, $state, Restangular, Audio, Config) {

  $scope.data = {
    type: 'storage',
    adapter: 'local',
    local: {
      type: 'local',
    },
    s3: {
      type: 's3',
      url: '',
      region: '',
      bucket: '',
      accessKeyId: '',
      secretAccessKey: ''
    }
  };

  Restangular.all('settings').getList({ type: 'storage' }).then(function(res){
    if (res.length) {
      $scope.data = res[0];
    }
  });

  $scope.save = function() {
    // strip trailing slash
    if ($scope.data.s3.url[$scope.data.s3.url.length-1] == '/') {
      $scope.data.s3.url = $scope.data.s3.url.substring(0, name.length-1);
    }
    if ('id' in $scope.data) {
      $scope.data.put().then(function(){
        $state.go('app.settings');
      });
    } else {
      Restangular.all('settings').post($scope.data).then(function(res){
        $state.go('app.settings');
      });
    }
  }

})

.controller('UsersCtrl', function($scope, $stateParams, $state, Restangular, $ionicPopup) {

  Restangular.all('users').getList().then(function(res){
    $scope.users = res;
  });

})

.controller('UsersAddCtrl', function($scope, $stateParams, $state, Restangular, $ionicPopup) {

  $scope.data = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  $scope.save = function() {
    $scope.data.confirmPassword = $scope.data.password;
    Restangular.all('signup').post($scope.data).then(function(res){
      $state.go('app.users');
    });
  };

})

.controller('UsersEditCtrl', function($scope, $stateParams, $state, Restangular, $ionicPopup) {

  Restangular.one('users', $stateParams.id).get().then(function(res){
    $scope.data = res;
    $scope.data.password = '';
  });

  $scope.save = function() {
    $scope.data.put().then(function(){
      $state.go('app.users');
    });
  };

})

.controller('HistoryListCtrl', function($scope, $stateParams, $state, Config, Restangular) {
  // $scope.shouldShowDelete = true;
  // $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $scope.delete = function(track) {
    debugger;
  }
})

.controller('HistoryCtrl', function($scope, $stateParams, $state, Config, Restangular, Audio) {

  $scope.data = { query: '' };

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  Restangular.all('plays').getList({ sort: '-createdAt'}).then(function(res){
    var plays = [];
    res.forEach(function(play){
      plays.push(play.plain())
      Audio.Playlist.add(play.plain());
    });
    $scope.plays = plays;
  });

})

.controller('LoginCtrl', function($scope, $http, $state, store, Config, Restangular){

  $scope.data = {
    url: Config.api.url
  };

  $scope.login = function(data) {

    if (data.url) {
      Restangular.setBaseUrl(data.url);
      Config.api.url = data.url;
    }

    $http.post(Config.api.url + '/login', data).then(function success(res){

      store.set('user', res.data);

      var headers = {
        Authorization: 'Bearer ' + store.get('user').token,
        accept: "application/json"
      };
      Restangular.setDefaultHeaders(headers);

    // @todo stops ionic from remembering login as a history state
      // window.location.href = '/#/app/history';
      // window.location.reload();
      $state.go('app.explore');
      // $state.go('app.history', {}, { location: 'replace' });
    }, function error(res){
      alert('Unauthorized');
    });
  }

})

.controller('ArtistCtrl', function($scope, $state, $stateParams, $http, Audio, MetaManager, $ionicPopup, $filter, $timeout) {

  $scope.data = {
    artist: null,
    albums: []
  };

  MetaManager.resetPage();

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  $scope.goAlbum = function(album) {
    $state.go('app.album', { artist: $stateParams.artist, album: album.id });
  }

  $scope.loadMore = function() {
    MetaManager.getAlbums($stateParams.artist).then(function(results){
      $timeout(function(){
        $scope.data.albums = $scope.data.albums.concat(results);
        $scope.data.albums.forEach(function(album){
          album.images[0].url = album.images[0].url || $scope.artist.images[0].url;
        });
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    });
  }

  $scope.filter = function() {
    var myPopup = $ionicPopup.show({
      template: '<input type="test" ng-model="data.filter">',
      title: 'Search Filter',
      // subTitle: 'Please use normal things',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Filter</b>',
          type: 'button-royal',
          onTap: function(e) {
            $scope.data.albums = $filter('filter')($scope.data.original, { name: $scope.data.filter }, false);
            return;
          }
        }
      ]
    });
  }

  if ($stateParams.artist) {
    // @todo fetch the artist for the album at the meta plugin level
    MetaManager.searchArtists($stateParams.artist).then(function(res){
      $scope.artist = res[0];
      MetaManager.getAlbums($stateParams.artist).then(function(results){
        $scope.data.original = results;
        $scope.data.albums = results;
        $scope.data.albums.forEach(function(album){
          album.images[0].url = album.images[0].url || $scope.artist.images[0].url;
        });
      });
    });
  }
})

.controller('AlbumCtrl', function($scope, $state, $stateParams, $http, Audio, MetaManager, $timeout){

  $scope.data = {
    album: null,
    artist: null
  };

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  if ($stateParams.album) {
    MetaManager.getAlbum($stateParams.album).then(function(res){
      $timeout(function(){
        $scope.data.album = res;
        Audio.Playlist.add({ tracks: $scope.data.album.tracks });
      });
    });
  }
})

.controller('LibraryCtrl', function($scope, $state, $http, Audio, Restangular) {

  $scope.data = {};

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  Restangular.all('tracks').getList().then(function(tracks){
    $scope.artists = [];
    tracks.forEach(function(track){
      if (!_.find($scope.artists, { name: track.artist.name })) {
        $scope.artists.push({ name: track.artist.name });
      } else {
        // nada
      }
    });
    $scope.artists = _.sortBy($scope.artists, ['name']);
  });

})

.controller('LibraryArtistCtrl', function($scope, $state, $stateParams, Restangular, $ionicActionSheet) {

  $scope.data = {};

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  $scope.artist = $stateParams.artist;

  Restangular.all('tracks').getList().then(function(tracks){
    $scope.albums = [];
    tracks.forEach(function(track){
      if (track.artist.name != $stateParams.artist) {
        return;
      }
      if (!_.find($scope.albums, { name: track.album.name })) {
        $scope.albums.push({ name: track.album.name, artist: track.artist.name });
      } else {
        // nada
      }
    });
    $scope.albums = _.sortBy($scope.albums, ['name']);
  });

})

.controller('LibraryAlbumCtrl', function($scope, $state, $stateParams, Restangular, Audio, $ionicActionSheet) {

  $scope.artist = $stateParams.artist;
  $scope.album = $stateParams.album;

  $scope.data = {};

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  Restangular.all('tracks').getList().then(function(tracks){
    var out = [];
    tracks.forEach(function(track){
      // @todo fix spam
      if (track.album.name != $stateParams.album) {
        return;
      }
      if (!_.find(out, { name: track.name })) {
        out.push(track.plain());
      } else {
        // nada
      }
    });
    $scope.tracks = _.sortBy(out, ['name']);
    Audio.Playlist.add({ tracks: $scope.tracks });
  });

  $scope.deleteTrack = function(track, index) {
    return Restangular.all('tracks/remove').post(track).then(function(track){
      return $scope.tracks.splice(index, 1);
    });
  }

  $scope.actions = function(index) {

    var hideSheet = $ionicActionSheet.show({
      // buttons: [
      //   { text: '<b>Share</b> This' },
      //   { text: 'Move' }
      // ],
      destructiveText: 'Delete',
      titleText: 'Track Options',
      cancelText: 'Cancel',
      cancel: function() {
        // add cancel code..
      },
      buttonClicked: function(index) {
        return true;
      },
      destructiveButtonClicked: function() {
        $scope.deleteTrack($scope.tracks[index], index).then(hideSheet)
      }
    });

  };

})

.controller('ExploreCtrl', function($scope, $state, $stateParams, $http, $ionicPopover, Audio, MetaManager, $timeout) {

  $scope.data = {
    query: " ",
    albums: null
  };

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  MetaManager.searchArtists().then(function(res){
    $timeout(function(){
      $scope.data.artists = res;
    });
  });
})

.controller('SearchCtrl', function($scope, $state, $stateParams, $http, $ionicPopover, Audio, MetaManager) {

  $scope.data = {};

  $scope.doSearch = function() {
    $scope.data.albums = null;
    $scope.searchTracks();
    $scope.searchArtists();
  }

  $scope.search = function() {
    $scope.doSearch();
  }

  $scope.getAlbums = function(item) {
    Meta.getAlbums(item, function(results){
      $scope.data.albums = results;
    });
  }

  $scope.searchArtists = function() {
    MetaManager.searchArtists($scope.data.query).then(function(artists){
      $scope.data.artists = artists;
    });
  }

  $scope.searchTracks = function() {
    MetaManager.searchTracks($scope.data.query).then(function(results){
      $scope.data.tracks = results;
      Audio.Playlist.add({ tracks: $scope.data.tracks });
    });
  }

  if ('query' in $stateParams && $stateParams.query) {
    $scope.data.query = $stateParams.query;
    $scope.searchTracks();
    $scope.searchArtists();
  }

  $ionicPopover.fromTemplateUrl('my-popover.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

});
