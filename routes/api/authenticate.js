var passport = require('passport');
var jwt = require('jsonwebtoken');

exports.verifyUser = passport.authenticate('jwt', {session: false});
exports.verifyAdmin= function (req, res, next) {
    if (req.user.admin) {
        next();
    } else {
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}