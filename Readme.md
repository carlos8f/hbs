# hbs #

The [original hbs](https://github.com/donpark/hbs) intended to provide support
for using [handlebars.js](http://github.com/wycats/handlebars.js) as an
Express.js view engine. However, it seems that handlebars.js supports this
natively!

The new purpose is to provide a nice middleware for jit-precompiling handlebar
templates into javascript, for use on the client side.

## Usage ##

To set `hbs` as default view engine:

    app.set("view engine", "hbs");

To use the jit-precompiler:

    app.use(require('hbs').middleware(
      src: "assets", // Source template path
      dest: "public", // Destination for compiled .js code
      ext: ".hbs" // Change if you use a non-standard template extension
    ));
