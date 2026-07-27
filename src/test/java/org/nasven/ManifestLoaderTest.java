package org.nasven;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ManifestLoaderTest {
    @TempDir
    Path directory;

    private final ManifestLoader loader = new ManifestLoader();

    @Test
    void loadsDirectoryAndDefaultsMain() throws Exception {
        Files.writeString(directory.resolve("package.json"), """
                {
                  "name": "sample",
                  "dependencies": {
                    "maven": ["org.example:library:1.0"]
                  }
                }
                """);
        Files.writeString(directory.resolve("index.js"), "print('ok');");

        AppDefinition app = loader.load(directory);

        assertEquals("sample", app.name());
        assertEquals(directory.resolve("index.js"), app.mainScript());
        assertEquals(1, app.dependencies().size());
    }

    @Test
    void loadsExplicitManifestAndCustomMain() throws Exception {
        Path manifest = directory.resolve("package.json");
        Files.writeString(manifest, """
                {"main":"scripts/main.js","options":"-scripting"}
                """);
        Files.createDirectories(directory.resolve("scripts"));
        Files.writeString(directory.resolve("scripts/main.js"), "print('ok');");

        AppDefinition app = loader.load(manifest);

        assertEquals(directory.resolve("scripts/main.js"), app.mainScript());
        assertEquals("-scripting", app.options());
    }

    @Test
    void rejectsEmptyMain() throws Exception {
        Files.writeString(directory.resolve("package.json"), """
                {"main":""}
                """);

        NasvenException error = assertThrows(NasvenException.class, () -> loader.load(directory));

        assertEquals(2, error.exitCode());
    }

    @Test
    void rejectsJavaFxOptionExplicitly() throws Exception {
        Files.writeString(directory.resolve("package.json"), """
                {"options":"-fx"}
                """);
        Files.writeString(directory.resolve("index.js"), "print('ok');");

        NasvenException error = assertThrows(NasvenException.class, () -> loader.load(directory));

        assertEquals(2, error.exitCode());
    }

    @Test
    void rejectsNonArrayMavenDependencies() throws Exception {
        Files.writeString(directory.resolve("package.json"), """
                {"dependencies":{"maven":"org.example:library:1.0"}}
                """);
        Files.writeString(directory.resolve("index.js"), "print('ok');");

        assertThrows(NasvenException.class, () -> loader.load(directory));
    }
}
