FROM glassfish/openjdk

MAINTAINER Bruno Borges <bruno.borges@gmail.com>

ENV MAVEN_VERSION 3.3.3
ENV MAVEN_URL http://www.us.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip
ENV MAVEN_FILE apache-maven-$MAVEN_VERSION-bin.zip
ENV MAVEN_OPTS=-Dmaven.artifact.threads=10
ENV PATH $PATH:/apache-maven-$MAVEN_VERSION/bin:/nasven
ENV NASVEN_NORUN true
ENV NASVEN_DEBUG true

RUN apk add --update wget unzip perl git && \
    wget $MAVEN_URL && \
    unzip $MAVEN_FILE && \
    rm $MAVEN_FILE && \
    git clone --recursive --depth=1 https://github.com/nasven/nasven.git && \
    apk del wget unzip git perl && \
    chmod a+x /nasven/nasven /nasven/nasven.js && \
    nasven /nasven/samples/asciidoctor && \
    nasven /nasven/samples/csv && \
    nasven /nasven/samples/jaxrs && \
    nasven /nasven/samples/jetty && \
    nasven /nasven/samples/mqtt && \
    nasven /nasven/samples/ratpack && \
    nasven /nasven/samples/spark && \
    nasven /nasven/samples/twitter4j && \
    nasven /nasven/samples/tomcat

ENV NASVEN_NORUN false
ENV NASVEN_DEBUG false

ENTRYPOINT ["/nasven/nasven"]

CMD ["/app"]
