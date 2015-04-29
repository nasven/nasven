Nasven.js
=====
This project allows developers to code Javascript applications that run on top of the Java Platform and that may have dependencies on Apache Maven artifacts. Developers can build pure server-side applications, shell scripts, or even desktop applications with JavaFX. Any Maven dependency will be downloaded and configured in the classpath automatically.

## Requirements
You must have installed in your environment the following softwares:
 - Java SE 8
 - Apache Maven 3+

## Docker
You can also use the Docker image **nasven/nasven.js** published in Docker Hub.

        # docker run -it nasven/nasven.js nasven.js -- /nasven/samples/helloworld

## Example
The samples folder contains a Nashorn application that depends on the JAX-RS Client API. The application is coded inside the file [jaxrs.js](samples/jaxrs/jaxrs.js). In order to run this application, you have to download all the dependencies of JAX-RS Client API, and an implementation of the specification. To simplify things, it is easier to use [Apache Maven](http://maven.apache.org). The configuration of this sample Nashorn Maven application is defined in the file [app.def](samples/jaxrs/appdef.js) of the JAX-RS Sample. To run this application, use one of the following commands:

        $ jjs -scripting nasven.js -- samples/jaxrs arg0 arg1 arg2 ...
        
        $ ./nasven.js -- samples/jaxrs/appdef.js arg0 arg1 arg2 ...

You can read arguments inside your code with ''arguments[0]'', ''arguments[1]'', and so on.

## Nasven Application Definition File
The configuration file is a Javascript file with a **appdef** object with the following attributes:
 - main: the script to be actually executed
 - options: options to be passed to **jjs**. See **jjs -help** for more information.
 - dependencies: an array of Maven artifacts your script depends on. Format of the string is as follows: groupId:artifactId:version

### Example of Application Definition File
```javascript
var appdef = {
  main: "your-javafx-app.js",
  options: "-fx -doe",
  dependencies: ["org.glassfish.jersey.core:jersey-client:2.17", 
                 "org.glassfish.jersey.connectors:jersey-grizzly-connector:2.17"]
}
```

## License
GPL+CDDL
