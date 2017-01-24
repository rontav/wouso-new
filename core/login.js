// Responses
var msgNeedLogin = {
  'message'     : 'Permission denied',
  'description' : 'You need to login'
}

var msgNeedPriviledges = {
  'message'     : 'Permission denied',
  'description' : 'Not enough priviledges to access this resource'
}

module.exports = {

  isRoot: function (req, res, next) {
    if (!req.user) {
      res.send(msgNeedLogin);
    } else if (req.user.role > 0) {
      res.send(msgNeedPriviledges);
    } else {
      next();
    }
  },

  isAdmin: function (req, res, next) {
    if (!req.user) {
      res.send(msgNeedLogin);
    } else if (req.user.role > 1) {
      res.send(msgNeedPriviledges);
    } else {
      next();
    }
  },

  isTeacher: function (req, res, next) {
    if (!req.user) {
      res.send(msgNeedLogin);
    } else if (req.user.role > 2) {
      res.send(msgNeedPriviledges);
    } else {
      next();
    }
  },

  isContributor: function (req, res, next) {
    if (!req.user) {
      res.send(msgNeedLogin);
    } else if (req.user.role > 3) {
      res.send(msgNeedPriviledges);
    } else {
      next();
    }
  },

  isUser: function (req, res, next) {
    if (!req.user) {
      res.send(msgNeedLogin);
    } else {
      next();
    }
  }

}
