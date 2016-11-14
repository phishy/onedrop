/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var userHome = require('user-home');

 global.AppService = {
  //  isDesktop: true,
   isDesktop: (process.env.FORK) ? true : false,
   userHomePath: userHome
 };

module.exports.bootstrap = function(cb) {

  User.find({ email: 'admin@example.com' }).then(function(user){
    if (!user.length) {
      User.create({ email: 'admin@example.com', admin: true, password: '$2a$10$QW3KJjMWKiRyHrLCSkjkqeZaM6MBzwl1gGXohStEVKkWUY3VUmtgK'}).then(function(){
        cb();
      });
    } else {
      cb();
    }
  });
  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  // cb();
};
