/**
 * This is an example of a Nashorn Maven application.
 *
 * Author: Bruno Borges (@brunoborges)
 * Since: 2015
 */
var appdef = {
  main: "jaxrs.js",
  options: "-scripting",
  dependencies: ["org.glassfish.jersey.core:jersey-client:2.17", 
                 "org.glassfish.jersey.connectors:jersey-grizzly-connector:2.17"]
}
