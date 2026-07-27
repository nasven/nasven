FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /src
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
COPY nasven install README.md ./
RUN mvn -q -DskipTests package

FROM eclipse-temurin:25-jre

WORKDIR /opt/nasven
COPY --from=build /src/target/nasven.jar ./lib/nasven.jar
COPY --from=build /src/nasven ./nasven
COPY docker/smoke ./smoke
RUN chmod 0755 ./nasven && ./nasven ./smoke docker-smoke

WORKDIR /app
ENTRYPOINT ["/opt/nasven/nasven"]
CMD ["/app"]
