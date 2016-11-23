var modules =  [
  'ionic',
  'angular-loading-bar',
  'cfp.loadingBar',
  'angular-storage',
  'restangular',
  'ngCordova',
  'angular-clipboard'
];

Onedrop.modules = Onedrop.modules.concat(modules);

angular.module('onedrop', Onedrop.modules)

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

  .state('app.thanks', {
    url: '/thanks',
    views: {
      'menuContent': {
        templateUrl: 'templates/thanks.html',
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

  .state('app.explore', {
    url: '/explore',
    views: {
      'menuContent': {
        controller: 'ExploreCtrl',
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
    url: '/artist/:artist/album/:album?track',
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

  .state('app.users', {
    url: '/users',
    views: {
      'menuContent': {
        controller: 'UsersCtrl',
        templateUrl: 'templates/users.html'
      }
    }
  })

  .state('app.users_add', {
    url: '/users/add',
    views: {
      'menuContent': {
        controller: 'UsersAddCtrl',
        templateUrl: 'templates/users_add.html'
      }
    }
  })

  .state('app.users_edit', {
    url: '/users/edit/:id',
    views: {
      'menuContent': {
        controller: 'UsersEditCtrl',
        templateUrl: 'templates/users_edit.html'
      }
    }
  })

  .state('app.global_storage', {
    url: '/global_storage',
    views: {
      'menuContent': {
        controller: 'GlobalStorageCtrl',
        templateUrl: 'templates/storage.html'
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

  .state('app.global_download', {
    url: '/global_download',
    views: {
      'menuContent': {
        controller: 'GlobalDownloadCtrl',
        templateUrl: 'templates/download.html'
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
    $state.go('app.explore');

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
