# Docker for Nasven.js
This Dockerfile extends **java:8-jdk** in order to run Nasven.js. It will install Maven 3 and clone Nasven.js GitHub repository and set it up in the /usr/local/bin to be easily executed inside the container. By default it will run **nasven.js** on top of **/appdef**. Mount your application in that volume.

To run, do: 

        # docker run -it nasven/nasven.js /nasven/samples/jaxrs
