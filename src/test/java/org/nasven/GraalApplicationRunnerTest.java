package org.nasven;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class GraalApplicationRunnerTest {
    @TempDir
    Path directory;

    @Test
    void exposesArgumentsInteropScriptingAndRequire() throws Exception {
        Path helper = directory.resolve("helper.js");
        Files.writeString(helper, """
                globalThis.helperLoads = (globalThis.helperLoads || 0) + 1;
                """);
        Path main = directory.resolve("index.js");
        Files.writeString(main, """
                var ArrayList = Java.type("java.util.ArrayList");
                var values = new ArrayList();
                values.add(arguments[0]);
                require("helper.js");
                require("helper.js");
                print("value=${values.get(0)} loads=${helperLoads}");
                """);
        AppDefinition app = new AppDefinition(
                "runtime-test",
                "1.0",
                directory.resolve("package.json"),
                directory,
                main,
                List.of(),
                "-scripting");
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        PrintStream output = new PrintStream(bytes, true, StandardCharsets.UTF_8);

        new GraalApplicationRunner(System.getenv(), output, output)
                .run(app, List.of(), new String[]{"argument with spaces"});

        assertTrue(bytes.toString(StandardCharsets.UTF_8)
                .contains("value=argument with spaces loads=1"));
    }
}
