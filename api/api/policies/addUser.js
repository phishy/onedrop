module.exports = function(req, res, next) {
  req.query.user = req.token;
  next();
};
