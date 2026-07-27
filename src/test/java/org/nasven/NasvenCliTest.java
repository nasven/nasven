package org.nasven;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class NasvenCliTest {
    @TempDir
    Path directory;

    @Test
    void noRunResolvesWithoutEvaluatingScript() throws Exception {
        Files.writeString(directory.resolve("package.json"), "{}");
        Files.writeString(directory.resolve("index.js"), "this is not valid JavaScript");
        Map<String, String> environment = new HashMap<>(System.getenv());
        environment.put("NASVEN_NORUN", "true");
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        PrintStream output = new PrintStream(bytes, true, StandardCharsets.UTF_8);

        int exitCode = new NasvenCli(environment, output, output)
                .run(new String[]{directory.toString()});

        assertEquals(0, exitCode);
        assertFalse(bytes.toString(StandardCharsets.UTF_8).contains("JavaScript execution failed"));
    }
}
