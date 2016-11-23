/**
 * Set to override api server
 *
 * @type {Object}
 */
Onedrop = {
  api: null,
  autologin: false,
  isConfigurable: true,
  meta: [
    { ns: 'iguana', class: 'ODIguana'}
  ],
  modules: [
  ]
};

OnedropMeta = {
  cache: function(url, data) {
    if (data) {

    } else {

    }
  },
  fetch: function(url, opts) {
    opts = opts || { accept: 'application/json '};
    return fetch(url, opts).then(function(res){
      return res.json();
    });
  }
}
