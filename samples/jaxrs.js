/**
 * This is a JAX-RS sample application. Requires JAX-RS Client API in classpath,
 * and Scripting extension of Nashorn.
 *
 * Author: Bruno Borges (@brunoborges)
 * Since: 2015
 */
var ClientBuilder = Packages.javax.ws.rs.client.ClientBuilder;
var client = ClientBuilder.newClient();
var target = client.target("http://ip.jsontest.com/");
 
var response = JSON.parse(target.request().get(java.lang.String.class));

print("Your IP address is ${response.ip}");
