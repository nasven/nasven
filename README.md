Nasven.js
=====
What is Nasven? Quoting [Lukas Eder](https://twitter.com/lukaseder):

        "Nasven = Nashorn + Maven. A tool to get Maven artifacts 
                  in scope for Nashorn script execution."

Nasven allows developers to code Javascript applications that run on top of the Java Platform (using Nashorn engine) and that may have dependencies on Apache Maven artifacts. Developers can build pure server-side applications, shell scripts, or even JavaFX desktop applications, and any Maven dependency will be downloaded and configured in the classpath automatically.

## Requirements
You must have installed in your environment the following softwares:
 - Java SE 8
 - Apache Maven 3+

## Installation
You can install on your Linux-based environment with the following command:

        $ curl -sSL j.mp/installnasven | sh

## Docker
You can use the Docker image **nasven/nasven.js** published in Docker Hub.

        # sudo docker run -it nasven/nasven.js /nasven/samples/helloworld

You can also map and run a local (on host) application:

        # sudo docker run -it -v `pwd`/samples/hellodocker:/app nasven/nasven.js

## Example
The [samples](https://github.com/nasven/samples) repository contains several **Nasven** applications. One of those samples is the **jaxrs** sample that uses the JAX-RS Client API. This sample application is coded inside the file [index.js](https://github.com/nasven/samples/jaxrs/index.js) of the JAX-RS sample. Prior to Nasven.js, in order to run this application sample, a developer would have to download all the dependencies of JAX-RS Client API, and an implementation of the specification. But it is much easier to use [Apache Maven](http://maven.apache.org) to depend on those artifacts. The configuration of this sample application is defined in the file [package.json](https://github.com/nasven/samples/jaxrs/package.json). To run this application, use one of the following commands:

        $ jjs -scripting nasven.js -- samples/jaxrs
        
        $ ./nasven samples/jaxrs

You can read arguments inside your code with ''arguments[0]'', ''arguments[1]'', and so on.

### Application Definition File **package.json**
Check the [samples](https://github.com/nasven/samples) repositoryr for more examples of the **package.json** files with defined Maven dependencies.

## Features
Every application executed with Nasven.js will have Nasven itself loaded to provide access to features defined in **nasven.js**:

 * require('path/to/file.js'): same as Nashorn load(), but only for local files and this will be watched for updates and reloaded on the fly.
 * daemon(): it will create a deamon Thread to keep the application up and running.
 * exec('command', suppress): same as Nashorn exec() except it will print output on demand if suppress is false. By default output is suppressed. Optional argument.
 * console.log('text'): same as print().

## License
MIT
