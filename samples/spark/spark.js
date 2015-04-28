/**
 * Author: Bruno Borges (@brunoborges)
 * Since: 2015
 */
var Spark = Packages.spark.Spark;
Spark.get("/", function(req, res) { return "Hello World" });

Nasven.daemon();
