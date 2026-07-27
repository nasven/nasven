package org.nasven;

import org.eclipse.aether.repository.RemoteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.jar.JarOutputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DependencyResolverTest {
    @TempDir
    Path directory;

    @Test
    void resolvesTransitiveClasspathFromFileRepository() throws Exception {
        Path remote = directory.resolve("remote");
        writeArtifact(remote, "org.example", "child", "1.0", "");
        writeArtifact(
                remote,
                "org.example",
                "root",
                "1.0",
                """
                <profiles>
                  <profile>
                    <id>jdk-runtime-dependencies</id>
                    <activation>
                      <jdk>[1,)</jdk>
                    </activation>
                    <dependencies>
                      <dependency>
                        <groupId>org.example</groupId>
                        <artifactId>child</artifactId>
                        <version>1.0</version>
                      </dependency>
                    </dependencies>
                  </profile>
                </profiles>
                """);

        RemoteRepository repository = new RemoteRepository.Builder(
                "test", "default", remote.toUri().toString()).build();
        DependencyResolver resolver = new DependencyResolver(
                directory.resolve("local"), List.of(repository));

        List<Path> classpath = resolver.resolve(
                List.of(MavenCoordinate.parse("org.example:root:1.0")));

        assertEquals(2, classpath.size());
        assertTrue(classpath.stream().anyMatch(path -> path.endsWith("root-1.0.jar")));
        assertTrue(classpath.stream().anyMatch(path -> path.endsWith("child-1.0.jar")));
    }

    private static void writeArtifact(
            Path repository,
            String groupId,
            String artifactId,
            String version,
            String dependencies) throws IOException {
        Path artifactDirectory = repository
                .resolve(groupId.replace('.', '/'))
                .resolve(artifactId)
                .resolve(version);
        Files.createDirectories(artifactDirectory);
        String pom = """
                <project xmlns="http://maven.apache.org/POM/4.0.0">
                  <modelVersion>4.0.0</modelVersion>
                  <groupId>%s</groupId>
                  <artifactId>%s</artifactId>
                  <version>%s</version>
                  %s
                </project>
                """.formatted(groupId, artifactId, version, dependencies);
        Files.writeString(artifactDirectory.resolve(artifactId + "-" + version + ".pom"), pom);
        try (JarOutputStream ignored = new JarOutputStream(Files.newOutputStream(
                artifactDirectory.resolve(artifactId + "-" + version + ".jar")))) {
            // An empty JAR is sufficient for classpath-resolution coverage.
        }
    }
}
