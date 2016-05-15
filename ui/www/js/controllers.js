var isDesktopApp = (window.location.protocol == 'file:') ? true : false;

if (isDesktopApp) {
  var appUrl = 'http://localhost:1337';
} else {
  var appUrl = window.location.origin + ':1337';
}

angular.module('starter.controllers', [])

.service('Audio', function($http, Config, store){
  this.currentIndex = 0;
  this.playlist = [];
  this.player = document.createElement('audio');

  var self = this;

  this.getTrackUrl = function(track) {
    return $http.post(Config.api.url + '/tracks/play', angular.toJson(track), {
      headers: { Authorization: 'Bearer ' + store.get('user').token }
    });
  }

  // this.addTrack = function(track) {
  //   this.getTrackUrl(track).then(function(url){
  //     track.url = url.data;
  //     self.playlist.push(track);
  //     console.log(self.playlist);
  //   });
  // }
})

.service('Config', function(){
  this.isDesktopApp = isDesktopApp;
  this.desktopMusicUrl = window.location.pathname.replace('/index.html', '');
  this.isAppConfigurable = true;
  this.isIphone = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  this.api = {
    url: appUrl
  }
})

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, cfpLoadingBar, store, Config, Audio, Meta) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  Audio.player.addEventListener('ended', function(){
    Audio.currentIndex++;
    var track = Audio.playlist[Audio.currentIndex];
    $scope.play(track);
    // Audio.player.src = track.url;
    // Audio.player.load();
    // Audio.player.play();
    // $scope.track = track;
  });

  // Audio.player.addEventListener('playing', function(){
  // 	$scope.track = Audio.playlist[Audio.currentIndex];
  // });
  //
  //
  $scope.Config = Config;

  $scope.play = function(track, index) {
    Audio.player.play();
    if (index) {
      Audio.currentIndex = index;
    }
    $scope.track = track;
    Audio.player.pause();
    cfpLoadingBar.start();
    $http.post(Config.api.url + '/tracks/play', angular.toJson(track), {
      headers: { Authorization: 'Bearer ' + store.get('user').token }
    }).then(function(results){
      var url = (Config.isDesktopApp) ? Config.desktopMusicUrl + results.data : results.data;
      Audio.player.src = url;
      Audio.player.load();
      Audio.player.play();
      cfpLoadingBar.complete();
    });
  }

  $scope.unpause = function() {
  	Audio.player.play();
  }

  $scope.pause = function() {
    Audio.player.pause();
  }

  $scope.previous = function() {
    Audio.currentIndex--;
    var track = Audio.playlist[Audio.currentIndex];
    $scope.play(track);
  }

  $scope.next = function() {
    Audio.currentIndex++;
    var track = Audio.playlist[Audio.currentIndex];
    $scope.play(track);
  }

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('WelcomeCtrl', function($scope, $stateParams) {
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('SettingsCtrl', function($scope, $stateParams, $http, Audio) {

})

.controller('DownloadCtrl', function($scope, $stateParams, $state, $http, Config, Restangular) {

  $scope.data = {
    download: {
      type: 'download'
    }
  };

  $http.get(Config.api.url + '/settings?type=download').then(function(res){
    if (res.data.length) {
      $scope.data.download = res.data[0];
    }
  });

  $scope.save = function() {
    if ('id' in $scope.data.download) {
      $http.put(Config.api.url + '/settings/' + $scope.data.download.id, $scope.data.download).then(function(res){
        $state.go('app.settings');
      });
    } else {
      $http.post(Config.api.url + '/settings', $scope.data.download).then(function(res){
        $state.go('app.settings');
      });
    }
  }

})

.controller('DownloadCtrl', function($scope, $stateParams, $state, Restangular, Audio, Config) {

  $scope.data = {
    type: 'download',
    adapter: 'youtube_scraper',
    youtube: {

    }
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

.controller('StorageCtrl', function($scope, $stateParams, $state, Restangular, Audio, Config) {

  $scope.data = {
    type: 'storage',
    adapter: 'local',
    local: {
      type: 'local',
      path: '/music'
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

.controller('HistoryListCtrl', function($scope, $stateParams, $state, Config, Restangular) {
  // $scope.shouldShowDelete = true;
  // $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $scope.delete = function(track) {
    debugger;
  }
})

.controller('HistoryCtrl', function($scope, $stateParams, $state, Config, Restangular) {

  $scope.data = { query: '' };

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  Restangular.all('plays').getList({ sort: '-createdAt'}).then(function(res){
    var plays = [];
    res.forEach(function(play){
      plays.push(play.plain())
    });
    $scope.plays = plays;
  });

})

.controller('LoginCtrl', function($scope, $http, $state, store, Config, Restangular){

  $scope.login = function(data) {
    $http.post(Config.api.url + '/login', data).then(function success(res){

      store.set('user', res.data);

      var headers = {
        Authorization: 'Bearer ' + store.get('user').token,
        accept: "application/json"
      };
      Restangular.setDefaultHeaders(headers);

    // @todo stops ionic from remembering login as a history state
      window.location.href = '/#/app/history';
      window.location.reload();
      // $state.go('app.history', {}, { location: 'replace' });
    }, function error(res){
      alert('Unauthorized');
    });
  }

})

.controller('NewCtrl', function($scope, $stateParams, $http, Audio) {

  $http.get('https://api.spotify.com/v1/browse/new-releases').then(function(results){
    $scope.data.new = results.data;
    debugger;
  });

})

.controller('ArtistCtrl', function($scope, $state, $stateParams, $http, Audio, Meta) {

  $scope.data = {};

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  if ($stateParams.artist) {
    Meta.getArtist($stateParams.artist, function(results){
      $scope.data.artist = results;
    });
    Meta.getAlbums($stateParams.artist, function(results){
      $scope.data.albums = results;
    });
  }

})

.controller('AlbumCtrl', function($scope, $state, $stateParams, $http, Audio, Meta){

  $scope.data = {};

  $scope.search = function() {
    $state.go('app.search', { query: $scope.data.query });
  }

  if ($stateParams.album) {
    Meta.getAlbum($stateParams.album, function(res){
      $scope.data.album = res;
      Audio.playlist = [];
      Audio.currentIndex = 0;
      $scope.data.album.tracks.forEach(function(track){
        Audio.playlist.push(track);
        // Audio.addTrack(track);
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

.controller('LibraryArtistCtrl', function($scope, $state, $stateParams, Restangular) {

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

.controller('LibraryAlbumCtrl', function($scope, $state, $stateParams, Restangular) {

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
  });

})

.controller('SearchCtrl', function($scope, $state, $stateParams, $http, $ionicPopover, Audio, Meta) {

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
    Meta.searchArtists($scope.data.query, function(results){
      $scope.data.artists = results;
    });
  }

  $scope.searchTracks = function() {
    Meta.searchTracks($scope.data.query, function(results){
      $scope.data.tracks = results;
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
