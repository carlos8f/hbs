// Handlebars already provides the .compile() method we need.
module.exports = require('handlebars');
// Add on middleware to jit-compile .hbs to .js.
module.exports.middleware = require('./middleware');