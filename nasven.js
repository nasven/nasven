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
var Nasven = new (function () {
    var jString = Java.type("java.lang.String");
    var Collectors = Java.type("java.util.stream.Collectors");
    var Arrays = Java.type("java.util.Arrays");
    var Files = Java.type("java.nio.file.Files");
    var File = Java.type("java.io.File");
    var Paths = Java.type("java.nio.file.Paths");
    var System = Java.type("java.lang.System");
    var Thread = Java.type("java.lang.Thread");

    function download(url, file) {
        with (new JavaImporter(java.net, java.nio.channels, java.io)) {
            var website = new URL(url);
            var rbc = Channels.newChannel(website.openStream());
            var fos = new FileOutputStream(file);
            fos.getChannel().transferFrom(rbc, 0, java.lang.Long.MAX_VALUE);
            rbc.close();
            fos.close();
        }
    }

    function isWindows() {
        return System.getProperty("os.name").toLowerCase().contains("win");
    }

    function checkPathExists(path) {
        if (Files.isReadable(path) === false) {
            print("ERROR: File '${path}' cannot be found or is not readable.");
            exit();
        }
    }

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
        appdef.parentPath = parentPath;
        return appdef;
    }

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
                    "  <build><plugins><plugin>" + 
                    "    <artifactId>maven-assembly-plugin</artifactId>" +
                    "    <configuration>" +
                    "       <outputDirectory>${appdef.parentPath}</outputDirectory>" +
                    "       <finalName>${appdef.name}-${appdef.version}</finalName>" +
                    "       <descriptorRefs>" +
                    "          <descriptorRef>jar-with-dependencies</descriptorRef>" +
                    "       </descriptorRefs>" +
                    "       <executions><execution><id>assemble-all</id><phase>validate</phase><goals><goal>single</goal></goals></execution></executions>" +
                    "    </configuration>" +
                    "  </plugin></plugins></build>" +
                    "</project>"

            var pomFile = Files.createTempFile('pom-', '-' + appdef.name + '.xml').toAbsolutePath();
            Files.write(pomFile, pomTemplate.getBytes());
            var cpFile = Files.createTempFile('cp-', appdef.name + '.cp').toAbsolutePath();
            print('[NASVEN] Building temporary Apache Maven project to find dependencies ...');
            var debugNasven = $ENV['NASVEN_DEBUG'] === 'true';
            var fatjar = $ENV['NASVEN_FATJAR'] === 'true' ? "assembly:assembly " : "";
            if (isWindows()) {
                exec("cmd.exe /C mvn -f ${pomFile} -Dmdep.outputFile=${cpFile} dependency:go-offline dependency:build-classpath ${fatjar}verify", !debugNasven);
            } else {
                exec("mvn -f ${pomFile} -Dmdep.outputFile=${cpFile} dependency:go-offline dependency:build-classpath ${fatjar}verify", !debugNasven);
            }
            print('[NASVEN] Done!');
            classpath = new jString(Files.readAllBytes(cpFile));
            return classpath;
        }
    }

    function run(classpath, appdef) {
        var mainScript = appdef.mainScriptPath;
        var options = appdef.options;
        var parentPath = appdef.parentPath;
        $ARG.shift(); // ignore first argument
        var newargs = $ARG.length > 0 ? '-- ' + $ARG.join(" ") : '';
        var options = typeof options === 'undefined' ? '' : options;
        print('[NASVEN] Calling jjs for your application ...');
        var command = "jjs -scripting=true ${options} -DskipNasven=true -cp ${classpath}${File.pathSeparator}${parentPath} ${__DIR__}/nasven.js ${mainScript} ${newargs}";
        var debugNasven = $ENV['NASVEN_DEBUG'] === 'true';
        if (debugNasven) {
          print("[NASVEN] ${command}");
        }
        exec(command);
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

    // vars used by required(file)
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
        var requiredFile = {"file":"${file}","fileToWatch":"${fileToWatch}"};
        print("[NASVEN] Registring required file: "+JSON.stringify(requiredFile));
        requiredFiles.put(file.toString(), fileToWatch.toString());
        print("[NASVEN] File ${file} successfuly required.");
        if (typeof watchingThread === 'undefined') {
            watchingThread = new Thread(function() {
                while(true) {
                    var key = watchService.take();
                    print("[NASVEN] WatchService got an event: ${key}");
                    var modifiedFiles = new java.util.HashSet();
                    for each(var watchEvent in key.pollEvents()) {
                      var kind = watchEvent.kind();
                      print("[NASVEN] Kind of event: ${kind}");
                      if (kind === ENTRY_MODIFY) {
                          var fileName = watchEvent.context();
                          var fileIsRequired = requiredFiles.keySet().contains(fileName.toString());
                          print("[NASVEN] File modified: ${fileName}. Required: ${fileIsRequired}");
                          if (fileIsRequired) modifiedFiles.add(requiredFiles.get(fileName.toString()));
                      }
                    }
                    modifiedFiles.stream()
                        .map(function(f)f.toString())
                        .forEach(function(f) {
                           print("[NASVEN] Reloading file ${f}");
                           load(f); 
                         });
                    if (!key.reset()) break;
                }
            })
            watchingThread.setDaemon(true);
            watchingThread.start();
            print('[NASVEN] WatchService started for required files.');
        }
    }
    this.require = require;

    // Main body 
    if (java.lang.System.getProperty("skipNasven") !== 'true' && ($ARG.length === 0 || $ARG[0] === '-h')) {
        print('Usage:');
        print(' $> nasven [folder/ | folder/package.json] [arg0 arg1 arg2...]');
        print();
        print("To download dependencies to your local Maven repository without executing your app, set environment variable NASVEN_NORUN=true.");
        print("Example:");
        print(" $> NASVEN_NORUN=true nasven [folder/ | folder/package.json] [arg0 arg1 arg2...]");
        print();
        print("To debug Apache Maven, set environment variable NASVEN_DEBUG=true.");
        print("To create a fat jar with dependencies, set environment variables: NASVEN_FATJAR=true NASVEN_NORUN=true");
        print();
        exit(1);
    }

    if ($ARG[0] === 'upgrade') {
      print("[NASVEN] Upgrading Nasven.js ... ");
      var NASVEN_DIR = $ENV.HOME + "/.nasven";
      print("[NASVEN] Downloading latest Nasven.js from GitHub ... ");
      $EXEC("rm ${NASVEN_DIR}/nasven*");
      $EXEC("curl -sSL https://raw.githubusercontent.com/nasven/nasven/master/nasven -o ${NASVEN_DIR}/nasven");
      $EXEC("curl -sSL https://raw.githubusercontent.com/nasven/nasven/master/nasven.js -o ${NASVEN_DIR}/nasven.js");
      $EXEC("chmod +x ${NASVEN_DIR}/nasven*");
      print("[NASVEN] Nasven.js successfuly upgraded from GitHub! ");
      exit();  
    }

    var skipNasven = System.getProperty("skipNasven", "false");
    if (skipNasven === "false") {
        var appdef = getAppDef($ARG[0]);
        var classpath = buildClasspath(appdef);
        var nasvenNoRun = System.getProperty("nasvenNoRun", $ENV['NASVEN_NORUN']) === "true";
        if (nasvenNoRun === false) {
            // if nasvenNoRun is true, it will only download Maven dependencies
            print('[NASVEN] About to run your nasven.js application under '+appdef.mainScriptPath+' ... \n');
            run(classpath, appdef);
            print('[NASVEN] Application successfuly executed.');
        }
    }    
});

// Exported features
var console = {log:print};
var require = Nasven.require;
var exec = Nasven.exec;
