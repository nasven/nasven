package org.nasven;

public final class NasvenMain {
    private NasvenMain() {
    }

    public static void main(String[] args) {
        int exitCode = new NasvenCli(System.getenv(), System.out, System.err).run(args);
        if (exitCode != 0) {
            System.exit(exitCode);
        }
    }
}
