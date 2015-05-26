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
The samples folder contains a Nashorn application that depends on the JAX-RS Client API. The application is coded inside the file [index.js](samples/jaxrs/index.js) of the JAX-RS sample. Prior to Nasven.js, in order to run this application sample, a developer would have to download all the dependencies of JAX-RS Client API, and an implementation of the specification. To simplify things, it is easier to use [Apache Maven](http://maven.apache.org). The configuration of this sample Nashorn Maven application is defined in the file [package.json](samples/jaxrs/package.json) of the JAX-RS Sample. To run this application, use one of the following commands:

        $ jjs -scripting nasven.js -- samples/jaxrs arg0 arg1 arg2 ...
        
        $ ./nasven.js -- samples/jaxrs arg0 arg1 arg2 ...

You can read arguments inside your code with ''arguments[0]'', ''arguments[1]'', and so on.

### Example of Application Definition File
Check the **samples** folder for examples of **package.json** files with Maven dependencies. 

## License
GPL+CDDL
