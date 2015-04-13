var RatpackServer = Packages.ratpack.server.RatpackServer;

RatpackServer.start(function (server) { server 
  .handlers(function (chain) { chain
    .get(function (ctx) {ctx.render("Hello World!")})
    .get(":name", function (ctx) {ctx.render("Hello " + ctx.getPathTokens().get("name") + "!")})
  })
});

daemon();
