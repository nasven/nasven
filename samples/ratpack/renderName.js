function(ctx) {
  var name = ctx.getPathTokens().get("name");
  print("Rendering Hello ${name}");
  ctx.render("[${__FILE__}] Hello <${name}>!");
}
