package org.nasven;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.EnvironmentAccess;
import org.graalvm.polyglot.HostAccess;
import org.graalvm.polyglot.PolyglotException;
import org.graalvm.polyglot.Source;
import org.graalvm.polyglot.io.IOAccess;

import java.io.IOException;
import java.io.PrintStream;
import java.net.URL;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

final class GraalApplicationRunner {
    private static final String PRELUDE = """
            globalThis.require = function(file) {
                return Nasven.require(String(file));
            };
            globalThis.exec = function(command, suppress) {
                return Nasven.exec(String(command), suppress === undefined ? false : Boolean(suppress));
            };
            globalThis.daemon = function() {
                return Nasven.daemon();
            };
            """;

    private final Map<String, String> environment;
    private final PrintStream output;
    private final PrintStream error;

    GraalApplicationRunner(
            Map<String, String> environment,
            PrintStream output,
            PrintStream error) {
        this.environment = environment;
        this.output = output;
        this.error = error;
    }

    void run(AppDefinition app, List<Path> classpath, String[] arguments) throws NasvenException {
        List<URL> urls = new ArrayList<>();
        try {
            urls.add(app.root().toUri().toURL());
            for (Path entry : classpath) {
                urls.add(entry.toUri().toURL());
            }
        } catch (IOException e) {
            throw new NasvenException(4, "Unable to create the application class loader.", e);
        }

        try (ApplicationClassLoader classLoader = new ApplicationClassLoader(
                urls.toArray(URL[]::new), ClassLoader.getSystemClassLoader())) {
            Thread thread = Thread.currentThread();
            ClassLoader previousClassLoader = thread.getContextClassLoader();
            thread.setContextClassLoader(classLoader);
            NasvenRuntime runtime = new NasvenRuntime(app.root(), environment, output, error);
            try {
                try (Context context = Context.newBuilder("js")
                        .allowExperimentalOptions(true)
                        .option("js.nashorn-compat", "true")
                        .option("js.syntax-extensions", "true")
                        .option("js.scripting", "true")
                        .option("js.ecmascript-version", "2024")
                        .allowHostAccess(HostAccess.ALL)
                        .allowHostClassLookup(className -> true)
                        .allowHostClassLoading(true)
                        .allowIO(IOAccess.ALL)
                        .allowCreateProcess(true)
                        .allowEnvironmentAccess(EnvironmentAccess.INHERIT)
                        .environment(environment)
                        .currentWorkingDirectory(app.root())
                        .hostClassLoader(classLoader)
                        .arguments("js", arguments)
                        .out(output)
                        .err(error)
                        .build()) {
                    runtime.attach(context);
                    context.getBindings("js").putMember("Nasven", runtime);
                    context.eval(Source.newBuilder("js", PRELUDE, "nasven:prelude").buildLiteral());
                    context.eval(Source.newBuilder("js", app.mainScript().toFile()).build());
                } catch (PolyglotException e) {
                    throw new NasvenException(4, formatPolyglotError(e), e);
                }
            } finally {
                thread.setContextClassLoader(previousClassLoader);
            }
        } catch (IOException e) {
            throw new NasvenException(4, "Unable to close the application class loader.", e);
        }
    }

    private static String formatPolyglotError(PolyglotException error) {
        if (error.getSourceLocation() == null) {
            return "JavaScript execution failed: " + error.getMessage();
        }
        return "JavaScript execution failed at "
                + error.getSourceLocation().getSource().getName()
                + ":" + error.getSourceLocation().getStartLine()
                + ": " + error.getMessage();
    }
}
