package org.nasven;

import org.graalvm.polyglot.Context;
import org.graalvm.polyglot.Source;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CountDownLatch;

public final class NasvenRuntime {
    private final Path appRoot;
    private final Map<String, String> environment;
    private final PrintStream output;
    private final PrintStream error;
    private final Set<Path> requiredFiles = new HashSet<>();
    private Context context;

    NasvenRuntime(
            Path appRoot,
            Map<String, String> environment,
            PrintStream output,
            PrintStream error) {
        this.appRoot = appRoot;
        this.environment = environment;
        this.output = output;
        this.error = error;
    }

    void attach(Context context) {
        this.context = context;
    }

    public void require(String file) {
        Path script = appRoot.resolve(file).normalize().toAbsolutePath();
        if (!script.startsWith(appRoot)) {
            throw new IllegalArgumentException("Required file must remain under the application root: " + file);
        }
        if (!Files.isRegularFile(script) || !Files.isReadable(script)) {
            throw new IllegalArgumentException("Required file is not readable: " + script);
        }
        if (!requiredFiles.add(script)) {
            return;
        }
        try {
            context.eval(Source.newBuilder("js", script.toFile()).build());
        } catch (IOException | RuntimeException e) {
            requiredFiles.remove(script);
            throw new IllegalStateException("Unable to require " + script + ": " + e.getMessage(), e);
        }
    }

    public int exec(String command, boolean suppress) {
        ProcessBuilder processBuilder = new ProcessBuilder(CommandTokenizer.tokenize(command));
        processBuilder.directory(appRoot.toFile());
        Map<String, String> childEnvironment = processBuilder.environment();
        childEnvironment.clear();
        childEnvironment.putAll(environment);
        if (suppress) {
            processBuilder.redirectOutput(ProcessBuilder.Redirect.DISCARD);
            processBuilder.redirectError(ProcessBuilder.Redirect.DISCARD);
        }

        try {
            Process process = processBuilder.start();
            process.getOutputStream().close();
            if (suppress) {
                return process.waitFor();
            }
            Thread stdout = copyAsync(process.getInputStream(), output);
            Thread stderr = copyAsync(process.getErrorStream(), error);
            int exitCode = process.waitFor();
            stdout.join();
            stderr.join();
            return exitCode;
        } catch (IOException e) {
            throw new IllegalStateException("Unable to execute command: " + command, e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while executing command: " + command, e);
        }
    }

    public void daemon() {
        try {
            new CountDownLatch(1).await();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Nasven daemon interrupted.", e);
        }
    }

    private static Thread copyAsync(InputStream input, OutputStream output) {
        return Thread.startVirtualThread(() -> {
            try (input) {
                input.transferTo(output);
            } catch (IOException e) {
                throw new IllegalStateException("Unable to stream process output.", e);
            }
        });
    }
}
