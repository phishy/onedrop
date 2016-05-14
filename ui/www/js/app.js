angular.module('starter', [
  'starter.controllers',
  'ionic',
  'angular-loading-bar',
  'cfp.loadingBar',
  'onedrop-meta-spotify',
  'angular-storage',
  'restangular'
])

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.views.maxCache(0);

  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl',
  })

  .state('app.welcome', {
    url: '/welcome',
    views: {
      'menuContent': {
        templateUrl: 'templates/welcome.html',
      }
    }
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        controller: 'LoginCtrl',
        templateUrl: 'templates/login.html'
      }
    }
  })

  .state('app.logout', {
    url: '/logout',
    views: {
      'menuContent': {
        controller: function($state, $scope, store) {
          $scope.track = null;
          store.remove('user');
          $state.go('app.welcome');
        }
      }
    }
  })

  .state('app.library', {
    url: '/library',
    views: {
      'menuContent': {
        controller: 'LibraryCtrl',
        templateUrl: 'templates/library.html'
      }
    }
  })

  .state('app.library_artist', {
    url: '/library/artist/:artist',
    views: {
      'menuContent': {
        controller: 'LibraryArtistCtrl',
        templateUrl: 'templates/library_artist.html'
      }
    }
  })

  .state('app.library_album', {
    url: '/library/artist/:artist/:album',
    views: {
      'menuContent': {
        controller: 'LibraryAlbumCtrl',
        templateUrl: 'templates/library_album.html'
      }
    }
  })

  .state('app.search', {
    url: '/search?query',
    views: {
      'menuContent': {
        controller: 'SearchCtrl',
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.artist', {
    url: '/artist/:artist',
    views: {
      'menuContent': {
        controller: 'ArtistCtrl',
        templateUrl: 'templates/artist.html'
      }
    }
  })

  .state('app.album', {
    url: '/artist/:artist/album/:album',
    views: {
      'menuContent': {
        controller: 'AlbumCtrl',
        templateUrl: 'templates/album.html'
      }
    }
  })

  .state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        controller: 'SettingsCtrl',
        templateUrl: 'templates/settings.html'
      }
    }
  })

  .state('app.storage', {
    url: '/storage',
    views: {
      'menuContent': {
        controller: 'StorageCtrl',
        templateUrl: 'templates/storage.html'
      }
    }
  })

  .state('app.download', {
    url: '/download',
    views: {
      'menuContent': {
        controller: 'DownloadCtrl',
        templateUrl: 'templates/download.html'
      }
    }
  })

  .state('app.history', {
    url: '/history',
    views: {
      'menuContent': {
        templateUrl: 'templates/history.html',
        controller: 'HistoryCtrl'
      }
    }
  })

  .state('app.playlists', {
    url: '/playlists',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlists.html',
        controller: 'PlaylistsCtrl'
      }
    }
  })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise( function($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("app.history");
});
})

.run(function($ionicPlatform, $rootScope, $state, $http, Config, Restangular, store) {

  Restangular.setBaseUrl(Config.api.url);
  //Restangular.setDefaultHttpFields({cache: true});

  if (store.get('user')) {
    var headers = {
      Authorization: 'Bearer ' + store.get('user').token,
      accept: "application/json"
    };
    Restangular.setDefaultHeaders(headers);
  }

  // Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
  //   if(response.status === 401) {
  //     $rootScope.User = null;
  //     if ($state.current.name != 'login') {
  //       var redirectAttemptCount = $cookies.get('redirectAttemptCount');
  //       if (!redirectAttemptCount) {
  //         redirectAttemptCount = 1;
  //       } else {
  //         redirectAttemptCount++;
  //       }
  //       if (redirectAttemptCount >= 2) {
  //         $cookies.put('redirectAttemptCount', 0);
  //         $cookies.put('url', '/');
  //       } else {
  //         $cookies.put('redirectAttemptCount', redirectAttemptCount);
  //         $cookies.put('url', $location.absUrl());
  //       }
  //     }
  //     $state.go('login');
  //     return false; // error handled
  //   }
  //
  //   return true; // error not handled
  // });

  $rootScope.$on('$stateChangeStart',
    function (event, toState, toParams) {
      if (!store.get('user') && (toState.name != "app.welcome" && toState.name != 'app.login')) {
        event.preventDefault();
        $state.go('app.welcome');
      }
  });

  $ionicPlatform.ready(function() {


    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
});
