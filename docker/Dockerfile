FROM java:8-jdk 

MAINTAINER Bruno Borges <bruno.borges@gmail.com>

RUN wget http://apache.mirrors.hoobly.com/maven/maven-3/3.3.3/binaries/apache-maven-3.3.3-bin.zip -O maven3.zip && \
    unzip maven3.zip && \
    rm maven3.zip && \
    git clone https://github.com/nasven/nasven.git && \
    cp nasven/nasven.js /usr/local/bin && \
    chmod a+x /usr/local/bin/nasven.js

ENV PATH $PATH:/apache-maven-3.3.3/bin

CMD nasven.js -- /appdef
