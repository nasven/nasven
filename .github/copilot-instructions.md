# Copilot instructions for Nasven.js

## Runtime and validation

- This is a Java 8 Nashorn project, not a Node.js application. Use a JDK 8 distribution that includes `jjs` and Apache Maven 3+. `package.json` is metadata for Nasven itself; it defines no npm scripts or dependencies.
- Initialize the sample applications before using them: `git submodule update --init --recursive`.
- Run one sample/application with `./nasven samples/<name>` or `./nasven path/to/package.json`. The direct equivalent is `jjs -scripting nasven.js -- samples/<name>`.
- Resolve one sample's Maven dependencies without executing it with `NASVEN_NORUN=true ./nasven samples/<name>`. Add `NASVEN_DEBUG=true` to expose the generated Maven command and its output.
- Build a fat JAR for one sample with `NASVEN_FATJAR=true NASVEN_NORUN=true ./nasven samples/<name>`.
- There is no automated test or lint suite. Treat a targeted sample invocation as the single-scenario check, then run other affected samples when changing shared dependency resolution or launcher behavior.
- Build the container image from the repository root with `docker build -f docker/Dockerfile -t nasven.js-local .`. The Dockerfile clones `nasven/nasven` rather than copying the local build context, so this checks the published repository, not uncommitted local changes.

## Architecture

- `nasven` is the portable shell entry point. It finds the adjacent `nasven.js` and launches it through `jjs` with the Nashorn scripting and ES6 flags.
- `nasven.js` runs in two phases. The bootstrap phase accepts an application directory or `package.json`, normalizes its `main` entry, converts `dependencies.maven` coordinates into a temporary POM, asks Maven to resolve a classpath, and starts a second `jjs` process.
- The second process receives `-DskipNasven=true`, the resolved classpath, and the application directory. This prevents bootstrap recursion while loading the application's main script with its Maven artifacts available to Nashorn.
- The same script also exports application globals: `console.log`, `exec`, `daemon`, and the local-file `require` implementation. `require` is not CommonJS; it uses Nashorn `load()` and a Java NIO watch service to reload modified files.
- Nasven application manifests follow the repository's `package.json` shape: `main` defaults to `index.js`; `dependencies.maven` is an array of `groupId:artifactId:version` strings; and `options` is forwarded to the application `jjs` process.
- `samples` is a git submodule maintained in `nasven/samples`. `install` is a separate distribution path that downloads `nasven` and `nasven.js` into `~/.nasven` and adds that directory to shell profiles.

## Codebase conventions

- Preserve Nashorn scripting syntax in `nasven.js`: Java integration uses `Java.type`, `JavaImporter`, and Java package globals; launcher state comes from `$ARG`, `$ENV`, `$EXEC`, and `__DIR__`; double-quoted strings use Nashorn `${...}` interpolation.
- Do not enable strict mode or mechanically modernize the file as standard Node/browser JavaScript. The implementation relies on Nashorn-only constructs including `with (new JavaImporter(...))`, `for each`, and expression closures.
- Keep the two-phase guard intact: bootstrap behavior is controlled by the `skipNasven` Java system property, while user-facing modes use the exact lowercase string value `"true"` in `NASVEN_NORUN`, `NASVEN_DEBUG`, and `NASVEN_FATJAR`.
- Keep cross-platform process behavior paired. Maven invocation has explicit Windows and Unix branches, and application classpaths must use Java's `File.pathSeparator`.
- Resolve application paths through Java NIO and set `$ENV.PWD` to the manifest's parent before Maven execution or script loading; relative application files and the custom `require` depend on that working directory.
- The launcher script and `nasven.js` must remain adjacent when installed. Changes to invocation flags or file names usually require coordinated updates to `nasven`, `install`, README examples, and the Docker image setup.
