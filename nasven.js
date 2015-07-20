/* global Java, appdef, $ENV, $ARG, Packages, arguments, Files, Paths, Arrays, System */
/*
 * Nasven.js
 * 
 * This script is for running Javascript applications that may depend on Maven artifacts.
 * It will load your dependencies from an appdef.js file (see samples), fire Maven
 * to download dependencies for you, then setup the classpath for starting
 * Nashorn and your actual application.
 * 
 * See samples for more information.
 * 
 * Author: Bruno Borges (@brunoborges)
 * Version: 1.0
 * Since: April 2015
 */
if (java.lang.System.getProperty("skipNasven") !== 'true' && (arguments.length === 0 || arguments[0] === '-h')) {
    print('Usage:');
    print(' $> nasven [folder/ | folder/package.json]');
    print();
    print("To download dependencies to your local Maven repository without executing your app, set environment variable NASVEN_NORUN=true.");
    print("Example:");
    print(" $> NASVEN_NORUN=true nasven folder arg0 arg1");
    print();
    print("To debug Apache Maven, set environment variable NASVEN_DEBUG=true.");
    print();
    exit(1);
}

var Nasven = new (function () {
    var jString = Java.type("java.lang.String");
    var Collectors = Java.type("java.util.stream.Collectors");
    var Arrays = Java.type("java.util.Arrays");
    var Files = Java.type("java.nio.file.Files");
    var Paths = Java.type("java.nio.file.Paths");
    var System = Java.type("java.lang.System");
    var Thread = Java.type("java.lang.Thread");

    function checkPathExists(path) {
        if (Files.isReadable(path) === false) {
            print("ERROR: File '${path}' cannot be found or is not readable.");
            exit();
        }
    }
    this.checkPathExists = checkPathExists;

    function getAppDef(somePath) {
        var packageFile = Paths.get(somePath).toAbsolutePath();
        if (packageFile.toFile().isFile() === false) {
            packageFile = Paths.get(somePath, 'package.json').toAbsolutePath();
        }
        var parentPath = packageFile.getParent();
        checkPathExists(packageFile);
        $ENV.PWD = parentPath.toString();
        var appdef = loadAppDef(packageFile);

        var mainScriptPath = Paths.get(parentPath, appdef.main).toAbsolutePath();
        checkPathExists(mainScriptPath);
        appdef.mainScriptPath = mainScriptPath;
        return appdef;
    }
    // this.getAppDef = getAppDef;

    function loadAppDef(packageFile) {
        var appdef = JSON.parse(new jString(Files.readAllBytes(packageFile)));
        if (typeof appdef === 'undefined') {
            print("ERROR: Package Definition 'package.json' could not be found.");
            exit();
        } else if (typeof appdef.main === 'undefined' || appdef.main === 'index') {
            appdef.main = 'index.js';
        } else if (appdef.main === '') {
            print("ERROR: Your app ${$ARG[0]} does not contain a valid application.");
            exit();
        }
        return appdef;
    }

    function buildClasspath(appdef) {
        var classpath = '';
        if (typeof appdef.dependencies !== 'undefined') {
            var dependenciesCP = Arrays.stream(Java.to(appdef.dependencies.maven, "java.lang.String[]"))
                    .map(function (dep) {
                        return dep.split(":");
                    })
                    .map(function (tokens) {
                        return "<dependency>" +
                                "    <groupId>${tokens[0]}</groupId>" +
                                "    <artifactId>${tokens[1]}</artifactId>" +
                                "    <version>${tokens[2]}</version>" +
                                "</dependency>"
                    })
                    .collect(Collectors.joining("\n"));
            var pomTemplate =
                    "<project>" +
                    "  <modelVersion>4.0.0</modelVersion>" +
                    "  <groupId>nasven</groupId>" +
                    "  <artifactId>nasven-temp-artifact</artifactId>" +
                    "  <packaging>pom</packaging>" +
                    "  <version>1.0-SNAPSHOT</version>" +
                    "  <name>nasven-temp-artifact</name>" +
                    "  <dependencies>" +
                    "    ${dependenciesCP}" +
                    "  </dependencies>" +
                    "</project>"

            var pomFile = Files.createTempFile('pom-', '-' + appdef.name + '.xml').toAbsolutePath();
            Files.write(pomFile, pomTemplate.getBytes());
            var cpFile = Files.createTempFile('cp-', appdef.name + '.cp').toAbsolutePath();
            print('[NASVEN] Building temporary Apache Maven project to find dependencies ...');
            var debugNasven = $ENV['NASVEN_DEBUG'] === 'true';
            exec("mvn -f ${pomFile} -Dmdep.outputFile=${cpFile} dependency:go-offline dependency:build-classpath verify", !debugNasven);
            print('[NASVEN] Done!');
            classpath = new jString(Files.readAllBytes(cpFile));
            return classpath;
        }
    }

    function run(classpath, mainScript, options) {
        $ARG.shift(); // ignore first argument
        var newargs = $ARG.length > 0 ? '-- ' + $ARG.join(" ") : '';
        var options = typeof options === 'undefined' ? '' : options;
        print('[NASVEN] Calling jjs for your application ...');
        var command = "jjs ${options} -DskipNasven=true -cp ${classpath} ${__DIR__}/nasven.js ${mainScript} ${newargs}";
        exec(command);
    }

    // Main body 
    var skipNasven = System.getProperty("skipNasven", "false");
    if (skipNasven === "false") {
        var appdef = getAppDef($ARG[0]);
        var classpath = buildClasspath(appdef);
        var nasvenNoRun = System.getProperty("nasvenNoRun", $ENV['NASVEN_NORUN']) === "true";
        if (nasvenNoRun === false) {
            // if nasvenNoRun is true, it will only download Maven dependencies
            print('[NASVEN] About to run your nasven.js application under '+appdef.mainScriptPath+' ... \n');
            run(classpath, appdef.mainScriptPath, appdef.options);
            print('[NASVEN] Application successfuly executed.');
        }
    }

    // Exec with on-demand output
    function exec(args,suppress) {
        __exec_input(args, "", typeof suppress === 'undefined' ? false : suppress);
    }
    this.exec = exec;

    function __exec_input(args, input, suppress) {
        var StringArray = Java.type("java.lang.String[]");
        var jString = Java.type("java.lang.String");
        var CharArray = Java.type("char[]");
        var ProcessBuilder = Java.type("java.lang.ProcessBuilder");
        var File = Java.type("java.io.File");
        var InputStreamReader = Java.type("java.io.InputStreamReader");
        var OutputStreamWriter = Java.type("java.io.OutputStreamWriter");
        args = Java.to(args.split(' '), StringArray);
        input = String(input);
        var processBuilder = new ProcessBuilder(args);
        var environment = processBuilder.environment();
        environment.clear();
        for (var key in $ENV) {
            var value = $ENV[key];
            if (key === "PWD") {
                processBuilder.directory(new File(String(value)));
            }
            environment.put(String(key), String(value));
        }
        var process = processBuilder.start();
        var outThread = new Thread(
                function () {
                    var buffer = new CharArray(1024);
                    var inputStream = new InputStreamReader(process.getInputStream());
                    var length;
                    while ((length = inputStream.read(buffer,0,buffer.length)) !== -1) {
                        if (suppress === false) print(new jString(buffer,0,length-1));
                    }
                    inputStream.close();
                }
        );
        var errThread = new Thread(function () {
            var buffer = new CharArray(1024);
            var inputStream = new InputStreamReader(process.getErrorStream());
            var length;
            while ((length = inputStream.read(buffer,0,buffer.length)) !== -1) {
                if (suppress === false) print(new jString(buffer,0,length-1));
            }
            inputStream.close();
        });
        outThread.start(); errThread.start();
        var outputStream = new OutputStreamWriter(process.getOutputStream());
        outputStream.write(input, 0, input.length());
        outputStream.close();
        var exit = process.waitFor();
        outThread.join(); errThread.join();
    }

    this.daemon = function () {
        while (true) Thread.sleep(1000);
    };

    var ENTRY_MODIFY = java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY;
    var requiredFiles = new java.util.HashMap();
    var watchingThread;
    function require(file) {
        var fileToWatch = Paths.get($ENV.PWD, file).toAbsolutePath();
        print("[NASVEN] Requiring file: ${fileToWatch} ...");
        if (requiredFiles.containsKey(file) === true) {
           print('[NASVEN] File already required.');
           return;
        }
        load(file);
        var pwdPath = Paths.get($ENV.PWD);
        var watchService = pwdPath.getFileSystem().newWatchService();
        fileToWatch.getParent().register(watchService, ENTRY_MODIFY);
        requiredFiles.put(file, fileToWatch);
        print('[NASVEN] File successfuly required.');
        if (typeof watchingThread === 'undefined') {
            watchingThread = new Thread(function() {
                while(true) {
                    var key = watchService.take();
                    var modifiedFiles = new java.util.HashSet();
                    for each(var watchEvent in key.pollEvents()) {
                      var kind = watchEvent.kind();
                      if (kind === ENTRY_MODIFY) {
                          var fileName = watchEvent.context();
                          modifiedFiles.add(fileName.toAbsolutePath());
                      }
                    }
                    modifiedFiles
                        .stream()
                        .filter(function(f)requiredFiles.containsValue(f))
                        .map(function(f)f.toString())
                        .forEach(load);
                    var valid = key.reset();
                    if (!valid) break;
                }
            })
            watchingThread.setDaemon(true);
            watchingThread.start();
            print('[NASVEN] WatchService started for required files.');
        }
    }
    this.require = require;
    
});

var console = {log:print};
var require = Nasven.require;
