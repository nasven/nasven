# Docker for Nasven.js
This Dockerfile extends **java:8-jdk** in order to run Nasven.js. It will install Maven 3 and clone Nasven.js GitHub repository and set it up in the PATH variable to be easily executed inside the container. By default it will run **nasven.js** on top of **/app**. Mount your application in that volume, or point to an existing sample.

To run a specific path (sample) inside the container, you must do:

        # docker run -it nasven/nasven.js /nasven/samples/jaxrs

You can also map directly to a directory in your host system containing a nasven.js project (package.json)::

        # sudo docker run -it -v `pwd`:/app nasven/nasven.js

If you want to pass arguments to your mounted /app project, you will have to indicate '/app' as the first argument, for example:

        # sudo docker run -it -v `pwd`:/app nasven/nasven.js /app arg0 arg1 ...
