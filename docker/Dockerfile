FROM java:8-jdk 

MAINTAINER Bruno Borges <bruno.borges@gmail.com>

ENV MAVEN_VERSION 3.3.3
ENV MAVEN_URL http://www.us.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip

RUN wget $MAVEN_URL -O maven3.zip && \
    unzip maven3.zip && \
    rm maven3.zip && \
    git clone --depth=1 https://github.com/nasven/nasven.git && \
    chmod a+x /nasven/nasven.js

ENV PATH $PATH:/apache-maven-$MAVEN_VERSION/bin:/nasven

RUN nasven.js -DnasvenNoRun=true -- /nasven/samples/asciidoctor && \
    nasven.js -DnasvenNoRun=true -- /nasven/samples/csv && \
    nasven.js -DnasvenNoRun=true -- /nasven/samples/jaxrs && \
    nasven.js -DnasvenNoRun=true -- /nasven/samples/jetty && \
    nasven.js -DnasvenNoRun=true -- /nasven/samples/mqtt && \
    nasven.js -DnasvenNoRun=true -- /nasven/samples/ratpack && \
    nasven.js -DnasvenNoRun=true -- /nasven/samples/spark && \
    nasven.js -DnasvenNoRun=true -- /nasven/samples/tomcat

ENTRYPOINT ["/nasven/nasven.js", "--"]

CMD ["/appdef"]
