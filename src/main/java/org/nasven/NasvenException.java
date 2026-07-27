package org.nasven;

final class NasvenException extends Exception {
    private final int exitCode;

    NasvenException(int exitCode, String message) {
        super(message);
        this.exitCode = exitCode;
    }

    NasvenException(int exitCode, String message, Throwable cause) {
        super(message, cause);
        this.exitCode = exitCode;
    }

    int exitCode() {
        return exitCode;
    }
}
