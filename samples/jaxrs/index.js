/**
 * This is a JAX-RS sample application. Requires JAX-RS Client API in classpath,
 * and Scripting extension of Nashorn.
 *
 * Author: Bruno Borges (@brunoborges)
 * Since: 2015
 */
var ClientBuilder = Packages.javax.ws.rs.client.ClientBuilder;
var client = ClientBuilder.newClient();
var target = client.target("http://jsonplaceholder.typicode.com/users");
var response = JSON.parse(target.request().get(java.lang.String.class));
var length = response.length;
print("Number of users is ${response.length}");

print(JSON.stringify(response, null, 4));
