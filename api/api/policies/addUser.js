module.exports = function(req, res, next) {
  User.findOne(req.token).then(function(user){
    if ('admin' in user && user.admin && req.route.path == '/users') {
      // nada
      next();
    } else if (req.route.path == '/artists' || req.route.path == '/albums' || req.route.path == '/songs') {
      next();
    } else {
      req.query.user = req.token;
      next();
    }
  });
};
