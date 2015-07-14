FROM java:8-jdk 

MAINTAINER Bruno Borges <bruno.borges@gmail.com>

ENV MAVEN_VERSION 3.3.3
ENV MAVEN_URL http://www.us.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.zip
ENV PATH $PATH:/apache-maven-$MAVEN_VERSION/bin:/nasven
ENV MAVEN_FILE apache-maven-$MAVEN_VERSION-bin.zip
ENV MAVEN_OPTS=-Dmaven.artifact.threads=10
ENV NASVEN_NORUN true
ENV NASVEN_DEBUG true

RUN wget -O pcurl.sh "https://raw.githubusercontent.com/brunoborges/pcurl/master/pcurl.sh" && \
    bash pcurl.sh $MAVEN_URL && \
    rm pcurl.sh && \
    unzip $MAVEN_FILE && \
    rm $MAVEN_FILE && \
    git clone --depth=1 https://github.com/nasven/nasven.git && \
    chmod a+x /nasven/nasven /nasven/nasven.js && \
    apt-get autoremove -y --purge wget curl unzip zip && \
    nasven /nasven/samples/asciidoctor && \
    nasven /nasven/samples/csv && \
    nasven /nasven/samples/jaxrs && \
    nasven /nasven/samples/jetty && \
    nasven /nasven/samples/mqtt && \
    nasven /nasven/samples/ratpack && \
    nasven /nasven/samples/spark && \
    nasven /nasven/samples/tomcat

ENV NASVEN_NORUN false
ENV NASVEN_DEBUG false

ENTRYPOINT ["/nasven/nasven"]

CMD ["/app"]
