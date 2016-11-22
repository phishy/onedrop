/**
 * ArtistController
 *
 * @description :: Server-side logic for managing artists
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
 var elasticsearch = require('elasticsearch');

module.exports = {
  search: function(req, res) {
    var client = new elasticsearch.Client({
      host: 'elastic:9200'
    });
    client.search({
      type: 'artist',
      q: req.query.q,
      from: req.query.from,
      size: req.query.size
    }).then(function (body) {
      var hits = body.hits.hits;
      res.ok(hits);
    }, function (err) {
      res.serverError(err);
    });
  }
};
