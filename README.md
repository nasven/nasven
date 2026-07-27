# Nasven

Nasven runs JavaScript applications on JDK 25 with Java libraries resolved from Maven repositories. It embeds GraalJS and keeps the original Nasven application model: an application is a JavaScript entry point plus a `package.json` containing Maven coordinates.

## Requirements

- JDK 25 or later
- Apache Maven 3.9+ to build Nasven or use the source-based installer

Maven is not required when running an installed Nasven distribution. Application dependencies are resolved by the Maven Resolver libraries embedded in Nasven.

## Build and test

```sh
git submodule update --init --recursive
mvn verify
```

`mvn verify` runs unit and integration tests, builds the executable runtime, and executes a packaged end-to-end JavaScript application. The generated files are:

- `target/nasven.jar`
- `target/nasven-distribution.tar.gz`
- `target/nasven-distribution.zip`

Run an application from the repository:

```sh
./nasven samples/helloworld "argument with spaces"
```

The `nasven` launcher preserves argument boundaries and runs the application from its own directory so relative files behave consistently.

## Install or upgrade

The phase-one installer downloads the source archive, builds it with Maven, and installs the distribution under `~/.nasven`:

```sh
curl -fsSL https://raw.githubusercontent.com/nasven/nasven/master/install | sh
```

Run the same command again to upgrade. For a local checkout:

```sh
NASVEN_SOURCE_DIR="$PWD" ./install
```

## Application manifest

Nasven accepts an application directory or an explicit `package.json`:

```json
{
  "name": "example",
  "version": "1.0.0",
  "main": "index.js",
  "options": "-scripting",
  "dependencies": {
    "maven": [
      "org.apache.commons:commons-lang3:3.17.0"
    ]
  }
}
```

- `main` defaults to `index.js`; the legacy value `index` also maps to `index.js`.
- `dependencies.maven` is an array of `groupId:artifactId:version` coordinates. Runtime transitive dependencies are resolved from Maven Central and cached in `~/.m2/repository`.
- `options` may be omitted. `-scripting` is accepted as a compatibility no-op because scripting mode is always enabled. Other former `jjs` options fail explicitly.
- Arguments after the application path are exposed through the JavaScript `arguments` array.

Resolve dependencies without running the script:

```sh
NASVEN_NORUN=true ./nasven path/to/application
```

Print manifest, coordinates, and the resolved classpath:

```sh
NASVEN_DEBUG=true ./nasven path/to/application
```

## JavaScript runtime

Nasven configures GraalJS 25.0 with Nashorn compatibility, syntax extensions, scripting interpolation, application IO, and unrestricted Java host access. Applications are trusted local programs and can access the host through `Java.type`, `Packages`, package globals, and resolved Java libraries.

The following globals are available:

- `print(value)` and `console.log(value)`
- `require("relative/file.js")` and `Nasven.require(...)`: evaluate a local file once, relative to the application root
- `exec("command", suppress)` and `Nasven.exec(...)`: execute a process in the application directory; output is visible unless `suppress` is `true`
- `daemon()` and `Nasven.daemon()`: keep the application context alive

The original `helloworld` and `csv` samples run unchanged on this baseline, including `JavaImporter`, `for each`, Java package globals, scripting interpolation, and Maven-backed Java classes.

## Compatibility boundaries

Phase 1 intentionally does not silently emulate unsupported `jjs` behavior:

- JavaFX and `options: "-fx"` are not supported. JDK 25 does not bundle JavaFX, and the former `$STAGE` launcher contract needs a separate OpenJFX design.
- A GraalJS context cannot be entered concurrently. Java libraries that invoke JavaScript callbacks concurrently from worker threads need a future dispatch or serialization model.
- `require` preserves local evaluation and duplicate suppression, but automatic watch-and-reload is deferred because evaluating from a watcher thread conflicts with the context threading model.
- `NASVEN_FATJAR=true` is rejected. Application artifact assembly is separate from runtime dependency resolution.
- Unknown `jjs` options are rejected rather than ignored.
- GraalJS does not guarantee every Nashorn extension or every old third-party sample. Migration failures are reported with source locations.

## Docker

Build the JDK 25 image from the current checkout:

```sh
docker build -f docker/Dockerfile -t nasven.js-local .
```

Run a mounted application:

```sh
docker run --rm -v "$PWD/my-app:/app" nasven.js-local
```

Pass application arguments by naming `/app` first:

```sh
docker run --rm -v "$PWD/my-app:/app" nasven.js-local /app arg0 "arg one"
```

## License

MIT
