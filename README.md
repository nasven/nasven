Nashorn Maven Executor
=====
This project allows developers to code Nashorn applications that have dependency on Maven artifacts. It will download dependencies automatically, and then invoke the Nashorn application with the proper classpath.

## Requirements
You must have installed in your environment the following softwares:
 - JDK 8 (with Nashorn 'jjs')
 - Apache Maven 3+

## Example
The samples folder contains a Nashorn application that depends on the JAX-RS Client API. The application is coded inside the file [jaxrs.js](samples/jaxrs.js). In order to run this application, you have to download all the dependencies of JAX-RS Client API, and an implementation of the specification. To simplify things, it is easier to use [Apache Maven](http://maven.apache.org). The configuration of this sample Nashorn Maven application is defined in the file [jaxrs.mvn](samples/jaxrs.mvn). To run this application, use one of the following commands:

        $ jjs -scripting mvn.js -- samples/jaxrs.mvn
        
        $ ./mvn.sh -- samples/jaxrs.mvn

## License
GPL+CDDL
