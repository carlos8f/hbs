var hbs = require('./hbs')
  , fs = require('fs')
  , basename = require('path').basename
  , parse = require('url').parse;

module.exports = function(options){
  options = options || {};
  
  // Default directories.
  var srcDir = options.src || process.cwd()
    , destDir = options.dest || srcDir
    , match = options.match || /\.js$/
    , ext = options.ext || '.hbs'
    , namespace = options.namespace || 'Handlebars.templates';

  // Default compile callback
  var compile = options.compile || function(str, name, fn){
    try {
      var output = [];
      output.push('(function() {');
      output.push('var ' + namespace + ' = ' + namespace + ' || {};');
      output.push(namespace + '.' + name + ' = Handlebars.template(' + hbs.precompile(str) + ');');
      output.push('})();');
      fn(null, output.join('\n'));
    } catch (err) {
      fn(err);
    }
  };

  // Middleware
  return function compiler(req, res, next){
    if ('GET' != req.method) return next();
    var pathname = parse(req.url).pathname;

    if (match.test(pathname)) {
      var src = (srcDir + pathname).replace(match, ext)
        , dest = destDir + pathname
        , name = basename(pathname).replace(match, '');

      // Compare mtimes
      fs.stat(src, function(err, srcStats){
        if (err) {
          if ('ENOENT' == err.code) {
            next();
          } else {
            next(err);
          }
        } else {
          fs.stat(dest, function(err, destStats){
            if (err) {
              // Oh snap! it does not exist, compile it
              if ('ENOENT' == err.code) {
                compile();
              } else {
                next(err);
              }
            } else {
              // Source has changed, compile it
              if (srcStats.mtime > destStats.mtime) {
                compile();
              } else {
                // Defer file serving
                next();
              }
            }
          });
        }
      });

      // Compile to the destination
      function compile() {
        fs.readFile(src, 'utf8', function(err, str){
          if (err) {
            next(err);
          } else {
            compile(str, name, function(err, str){
              if (err) {
                next(err);
              } else {
                fs.writeFile(dest, str, 'utf8', function(err){
                  next(err);
                });
              }
            });
          }
        });
      }
      return;
    }
    next();
  };
};
