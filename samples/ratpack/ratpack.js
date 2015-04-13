/**
 * This is a sample application of Ratpack.IO using Nashorn. 
 *
 * Author: Bruno Borges (@brunoborges)
 * Since: 2015
 */
var RatpackServer = Packages.ratpack.server.RatpackServer;

RatpackServer.start(function (server) { server 
  .handlers(function (chain) { chain
    .get(function (ctx) {
      print('Rendering hello world');
      ctx.render("Hello World!")
    })
    .get(":name", function (ctx) {
      var name = ctx.getPathTokens().get("name");
      print("Rendering hello ${name}");
      ctx.render("Hello " + name + "!")
    })
  })
});

daemon();
