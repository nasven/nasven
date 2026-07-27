package org.nasven;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;

class NasvenRuntimeTest {
    @TempDir
    Path directory;

    @Test
    void execUsesApplicationDirectoryAndCanSuppressOutput() {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        PrintStream output = new PrintStream(bytes, true, StandardCharsets.UTF_8);
        Map<String, String> environment = new HashMap<>(System.getenv());
        environment.putIfAbsent("PATH", System.getenv().getOrDefault("PATH", ""));
        NasvenRuntime runtime = new NasvenRuntime(directory, environment, output, output);
        String java = Path.of(System.getProperty("java.home"), "bin", "java").toString();

        assertEquals(0, runtime.exec("\"" + java + "\" -version", false));
        assertTrue(bytes.toString(StandardCharsets.UTF_8).contains("version"));

        bytes.reset();
        assertEquals(0, runtime.exec("\"" + java + "\" -version", true));
        assertEquals("", bytes.toString(StandardCharsets.UTF_8));
    }

    @Test
    void execClosesChildStandardInput() throws URISyntaxException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        PrintStream output = new PrintStream(bytes, true, StandardCharsets.UTF_8);
        NasvenRuntime runtime = new NasvenRuntime(directory, System.getenv(), output, output);
        String java = Path.of(System.getProperty("java.home"), "bin", "java").toString();
        String testClasses = Path.of(
                NasvenRuntimeTest.class.getProtectionDomain().getCodeSource().getLocation().toURI())
                .toString();
        String command = "\"%s\" -cp \"%s\" \"%s\"".formatted(
                java, testClasses, StdinReader.class.getName());

        assertTimeoutPreemptively(
                Duration.ofSeconds(10),
                () -> assertEquals(0, runtime.exec(command, true)));
    }

    public static final class StdinReader {
        private StdinReader() {
        }

        public static void main(String[] args) throws IOException {
            System.in.readAllBytes();
        }
    }
}
