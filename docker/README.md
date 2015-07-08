# Docker for Nasven.js
<<<<<<< HEAD
This Dockerfile extends **java:8-jdk** in order to run Nasven.js. It will install Maven 3 and clone Nasven.js GitHub repository and set it up in the /usr/local/bin to be easily executed inside the container. By default it will run **nasven** on top of **/app**. Mount your application in that volume.
=======
This Dockerfile extends **java:8-jdk** in order to run Nasven.js. It will install Maven 3 and clone Nasven.js GitHub repository and set it up in the PATH variable to be easily executed inside the container. By default it will run **nasven.js** on top of **/app**. Mount your application in that volume, or point to an existing sample.
>>>>>>> b9dcea601a960ed7cbf9d6e119610e721d1759f6

To run a specific path (sample) inside the container, you must do:

        # docker run -it nasven/nasven.js /nasven/samples/jaxrs

You can also map directly to a directory in your host system:

        # sudo docker run -it -v `pwd`/samples/hellodocker:/app nasven/nasven.js
