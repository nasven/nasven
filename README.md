Nashorn Maven Executor
=====
This project allows developers to code Nashorn applications that have dependency on Maven artifacts. It will download dependencies automatically, and then invoke the Nashorn application with the proper classpath.

## Requirements
You must have installed in your environment the following softwares:
 - JDK 8 (with Nashorn 'jjs')
 - Apache Maven 3+

## Example
The samples folder contains a Nashorn application that depends on the JAX-RS Client API. The application is coded inside the file [jaxrs.js](samples/jaxrs/jaxrs.js). In order to run this application, you have to download all the dependencies of JAX-RS Client API, and an implementation of the specification. To simplify things, it is easier to use [Apache Maven](http://maven.apache.org). The configuration of this sample Nashorn Maven application is defined in the file [jaxrs.mvn](samples/jaxrs/jaxrs.mvn). To run this application, use one of the following commands:

        $ jjs -scripting mvn.js -- samples/jaxrs/jaxrs.mvn arg0 arg1 arg2 ...
        
        $ ./mvn.js -- samples/jaxrs/jaxrs.mvn arg0 arg1 arg2 ...

You can read arguments inside your code with ''arguments[0]'', ''arguments[1]'', and so on.

## Nashorn Maven Configuration File
The configuration file is a Javascript file with a **maven** object with the following attributes:
 - main: the script to be actually executed
 - options: options to be passed to **jjs**
 - dependencies: an array of Maven artifacts your script depends on. Format of the string is as follows: groupId:artifactId:version

### Example of Configuration File
```javascript
var maven = {
  main: "your-javafx-app.js",
  options: ["-fx"],
  dependencies: ["org.glassfish.jersey.core:jersey-client:2.17", 
                 "org.glassfish.jersey.connectors:jersey-grizzly-connector:2.17"]
}
```

## License
GPL+CDDL
