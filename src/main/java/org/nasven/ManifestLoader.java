package org.nasven;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

final class ManifestLoader {
    private final ObjectMapper objectMapper;

    ManifestLoader() {
        this(new ObjectMapper());
    }

    ManifestLoader(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    AppDefinition load(Path input) throws NasvenException {
        Path candidate = input.toAbsolutePath().normalize();
        Path manifest = Files.isDirectory(candidate) ? candidate.resolve("package.json") : candidate;
        if (!Files.isRegularFile(manifest) || !Files.isReadable(manifest)) {
            throw new NasvenException(2, "Application manifest is not readable: " + manifest);
        }

        JsonNode rootNode;
        try {
            rootNode = objectMapper.readTree(manifest.toFile());
        } catch (JsonProcessingException e) {
            throw new NasvenException(2, "Invalid JSON in " + manifest + ": " + e.getOriginalMessage(), e);
        } catch (IOException e) {
            throw new NasvenException(2, "Unable to read application manifest: " + manifest, e);
        }

        if (rootNode == null || !rootNode.isObject()) {
            throw new NasvenException(2, "Application manifest must contain a JSON object: " + manifest);
        }

        Path appRoot = manifest.getParent().toAbsolutePath().normalize();
        String main = text(rootNode, "main", null);
        if (main == null || "index".equals(main)) {
            main = "index.js";
        } else if (main.isBlank()) {
            throw new NasvenException(2, "Manifest field 'main' must not be empty: " + manifest);
        }
        Path mainScript = appRoot.resolve(main).normalize();
        if (!Files.isRegularFile(mainScript) || !Files.isReadable(mainScript)) {
            throw new NasvenException(2, "Application main script is not readable: " + mainScript);
        }

        String options = text(rootNode, "options", "");
        validateOptions(options, manifest);

        List<MavenCoordinate> dependencies = readDependencies(rootNode, manifest);
        String name = text(rootNode, "name", appRoot.getFileName().toString());
        String version = text(rootNode, "version", "");
        return new AppDefinition(name, version, manifest, appRoot, mainScript, dependencies, options);
    }

    private static String text(JsonNode root, String field, String defaultValue) throws NasvenException {
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            return defaultValue;
        }
        if (!node.isTextual()) {
            throw new NasvenException(2, "Manifest field '" + field + "' must be a string.");
        }
        return node.textValue();
    }

    private static List<MavenCoordinate> readDependencies(JsonNode root, Path manifest)
            throws NasvenException {
        JsonNode dependencies = root.get("dependencies");
        if (dependencies == null || dependencies.isNull()) {
            return List.of();
        }
        if (!dependencies.isObject()) {
            throw new NasvenException(2, "Manifest field 'dependencies' must be an object: " + manifest);
        }
        JsonNode maven = dependencies.get("maven");
        if (maven == null || maven.isNull()) {
            return List.of();
        }
        if (!maven.isArray()) {
            throw new NasvenException(2, "Manifest field 'dependencies.maven' must be an array: " + manifest);
        }
        List<MavenCoordinate> coordinates = new ArrayList<>();
        for (JsonNode node : maven) {
            if (!node.isTextual()) {
                throw new NasvenException(
                        2, "Every entry in 'dependencies.maven' must be a string: " + manifest);
            }
            coordinates.add(MavenCoordinate.parse(node.textValue()));
        }
        return List.copyOf(coordinates);
    }

    private static void validateOptions(String options, Path manifest) throws NasvenException {
        if (options.isBlank()) {
            return;
        }
        for (String option : options.trim().split("\\s+")) {
            if ("-scripting".equals(option) || "-scripting=true".equals(option)) {
                continue;
            }
            if ("-fx".equals(option)) {
                throw new NasvenException(
                        2,
                        "Manifest option '-fx' is not supported on JDK 25. "
                                + "JavaFX compatibility is deferred: " + manifest);
            }
            throw new NasvenException(
                    2,
                    "Unsupported legacy jjs option '" + option + "' in " + manifest
                            + ". Phase 1 accepts only '-scripting'.");
        }
    }
}
