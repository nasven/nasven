/**
 * This is a sample application of Ratpack.IO using Nashorn. 
 *
 * Author: Bruno Borges (@brunoborges)
 * Since: 2015
 */
var RatpackServer = Packages.ratpack.server.RatpackServer;

RatpackServer.start(function (server) { server 
  .handlers(function (chain) { 
     chain
    .get(function(ctx){load('renderWorld.js')(ctx);})
    .get(":name",function(ctx){load('renderName.js')(ctx);});
  })
});

Nasven.daemon();
