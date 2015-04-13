var RatpackServer = Packages.ratpack.server.RatpackServer;

RatpackServer.start(function (server) { server 
  .handlers(function (chain) { chain
    .get(function (ctx) {
      print('Rendering hello world');
      ctx.render("Hello World!")
    })
    .get(":name", function (ctx) {
      print('Rendering hello ${ctx.getPathTokens().get("name")}');
      ctx.render("Hello " + ctx.getPathTokens().get("name") + "!")
    })
  })
});

daemon();
