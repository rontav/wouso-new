// This is essentially bulk require
var req = require.context('./', true, /\.json.*$/);
var exports = {};

req.keys().forEach( (file) => {
  var locale = file.replace('./', '').replace('.json', '');
  exports[locale] = req(file);
});

module.exports = exports;
