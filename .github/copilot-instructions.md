# Copilot instructions for Nasven

## Runtime and validation

- Nasven targets JDK 25 and embeds GraalJS. It no longer uses Java 8, Nashorn, or `jjs`.
- Use Apache Maven 3.9+ and JDK 25+. Run the complete build with `mvn verify`.
- `mvn verify` includes unit tests and a packaged-launcher end-to-end application. Use `mvn test` while iterating on Java behavior.
- Initialize the legacy samples with `git submodule update --init --recursive`.
- Run an application with `./nasven samples/<name>` or `./nasven path/to/package.json`.
- Resolve dependencies without running with `NASVEN_NORUN=true ./nasven <application>`.
- Enable manifest/resolver/classpath diagnostics with `NASVEN_DEBUG=true`.
- Build the local container with `docker build -f docker/Dockerfile -t nasven.js-local .`. The Dockerfile uses the local build context.

## Architecture

- `pom.xml` builds a JDK 25 executable shaded JAR plus ZIP/TAR distributions. The shaded manifest must retain `Multi-Release: true`, and service descriptors must be merged for Truffle and Maven Resolver.
- `nasven` is the POSIX launcher. It finds the adjacent installed JAR or `target/nasven.jar`, preserves argument boundaries, changes to the application directory, and starts Java with the required native/Unsafe access flags.
- `NasvenCli` handles help/upgrade modes, environment flags, manifest loading, resolution, and exit codes.
- `ManifestLoader` preserves the legacy `package.json` contract: `main` defaults to `index.js`, `dependencies.maven` contains `groupId:artifactId:version`, and only the legacy `-scripting` option is accepted.
- `DependencyResolver` embeds Maven Resolver, using Maven Central and `~/.m2/repository`; no external `mvn` process is used at runtime.
- `ApplicationClassLoader` is child-first for application libraries but parent-first for the JDK, GraalJS/Truffle, and Nasven runtime.
- `GraalApplicationRunner` creates one trusted GraalJS context with Nashorn compatibility, syntax extensions, scripting mode, application IO, host access, the resolved class loader, and exact application arguments.
- `NasvenRuntime` exports `require`, `exec`, and `daemon`. `require` evaluates canonical local files once; hot reload is deliberately not part of phase 1.

## Compatibility and security

- Nasven applications are trusted local code. `HostAccess.ALL`, unrestricted host-class lookup, IO, process creation, and inherited environment access are intentional parts of the application model.
- Keep `js.nashorn-compat`, `js.syntax-extensions`, and `js.scripting` explicit. They cover different compatibility surfaces.
- Preserve `Java.type`, `Packages`, Java package globals, `JavaImporter`, `Java.extend`/`Java.super`, `print`, `console.log`, and scripting interpolation when changing context configuration.
- A GraalJS context cannot be entered concurrently. Do not reintroduce watcher threads that evaluate JavaScript or claim concurrent server-callback compatibility without a tested dispatch design.
- JavaFX/`-fx`, automatic require reload, arbitrary `jjs` options, and `NASVEN_FATJAR` are explicit deferrals and must fail or remain documented rather than silently degrade.

## Codebase conventions

- Keep Java code under `src/main/java/org/nasven` and tests under `src/test/java/org/nasven`.
- Keep manifest, resolver, runtime, and process responsibilities separated; do not move bootstrap behavior back into JavaScript.
- Preserve source-aware error messages and distinct nonzero exit codes for manifest, resolution, and runtime failures.
- Keep shell scripts POSIX-compatible, quote every path/argument, and avoid `eval`.
- When changing shaded dependencies, run the packaged end-to-end test; in-process tests do not detect missing multi-release manifest entries or service descriptors.
- Do not modernize the external `samples` submodule or unrelated NetBeans metadata as part of runtime changes.
