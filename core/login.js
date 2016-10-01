module.exports = {

  isAdmin: function (req, res, next) {
    if (!req.user) {
      res.send({
        'message'     : 'Permission denied',
        'description' : 'You need to login'
      });
    } else if (req.user.role > 1) {
      res.send({
        'message'     : 'Permission denied',
        'description' : 'Not enough priviledges to access this resource'
      });
    } else {
      next();
    }
  },

  isContributor: function (req, res, next) {
    if (!req.user) {
      res.send({
        'message'     : 'Permission denied',
        'description' : 'You need to login'
      });
    } else if (req.user.role > 2) {
      res.send({
        'message'     : 'Permission denied',
        'description' : 'Not enough priviledges to access this resource'
      });
    } else {
      next();
    }
  }

}
