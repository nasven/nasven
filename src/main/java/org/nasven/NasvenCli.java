package org.nasven;

import java.io.PrintStream;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

final class NasvenCli {
    private static final String USAGE = """
            Usage:
              nasven [folder | folder/package.json] [arg0 arg1 ...]
              nasven --help
              nasven upgrade

            Environment:
              NASVEN_NORUN=true  Resolve dependencies without running the application.
              NASVEN_DEBUG=true  Print manifest, dependency, classpath, and runtime diagnostics.

            Phase 1 does not support NASVEN_FATJAR, JavaFX/-fx, or arbitrary jjs options.
            """;

    private final Map<String, String> environment;
    private final PrintStream output;
    private final PrintStream error;
    private final ManifestLoader manifestLoader;

    NasvenCli(Map<String, String> environment, PrintStream output, PrintStream error) {
        this(environment, output, error, new ManifestLoader());
    }

    NasvenCli(
            Map<String, String> environment,
            PrintStream output,
            PrintStream error,
            ManifestLoader manifestLoader) {
        this.environment = Map.copyOf(environment);
        this.output = output;
        this.error = error;
        this.manifestLoader = manifestLoader;
    }

    int run(String[] args) {
        boolean debug = enabled("NASVEN_DEBUG");
        try {
            verifyJavaVersion();
            if (args.length == 0 || "-h".equals(args[0]) || "--help".equals(args[0])) {
                output.print(USAGE);
                return args.length == 0 ? 1 : 0;
            }
            if ("upgrade".equals(args[0])) {
                output.println("Re-run the Nasven installer to upgrade:");
                output.println("  curl -fsSL https://raw.githubusercontent.com/nasven/nasven/master/install | sh");
                return 0;
            }
            if (enabled("NASVEN_FATJAR")) {
                throw new NasvenException(
                        2,
                        "NASVEN_FATJAR is not supported in phase 1. "
                                + "Runtime dependency resolution remains available.");
            }

            AppDefinition app = manifestLoader.load(Path.of(args[0]));
            if (debug) {
                output.println("[NASVEN] Manifest: " + app.manifest());
                output.println("[NASVEN] Main: " + app.mainScript());
                output.println("[NASVEN] Dependencies: " + app.dependencies().stream()
                        .map(MavenCoordinate::artifactCoordinate)
                        .toList());
            }

            Path localRepository = Path.of(
                    environment.getOrDefault("HOME", System.getProperty("user.home")),
                    ".m2",
                    "repository");
            output.println("[NASVEN] Resolving application dependencies ...");
            List<Path> classpath = new DependencyResolver(localRepository).resolve(app.dependencies());
            output.println("[NASVEN] Dependencies ready.");
            if (debug) {
                classpath.forEach(path -> output.println("[NASVEN] Classpath: " + path));
            }
            if (enabled("NASVEN_NORUN")
                    || "true".equals(System.getProperty("nasvenNoRun", "false"))) {
                return 0;
            }

            String[] appArguments = Arrays.copyOfRange(args, 1, args.length);
            output.println("[NASVEN] Running " + app.mainScript() + " ...");
            new GraalApplicationRunner(environment, output, error).run(app, classpath, appArguments);
            output.println("[NASVEN] Application completed.");
            return 0;
        } catch (NasvenException e) {
            error.println("[NASVEN] ERROR: " + e.getMessage());
            if (debug && e.getCause() != null) {
                e.printStackTrace(error);
            }
            return e.exitCode();
        } catch (RuntimeException e) {
            error.println("[NASVEN] ERROR: " + e.getMessage());
            if (debug) {
                e.printStackTrace(error);
            }
            return 5;
        }
    }

    private boolean enabled(String name) {
        return "true".equals(environment.get(name));
    }

    private static void verifyJavaVersion() throws NasvenException {
        int feature = Runtime.version().feature();
        if (feature < 25) {
            throw new NasvenException(
                    2, "Nasven requires JDK 25 or later; detected Java " + feature + ".");
        }
    }
}
