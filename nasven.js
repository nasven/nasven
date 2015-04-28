#!/usr/bin/jjs -J-Dnashorn.args="-fv -doe -scripting -ot" 
/*
 * Nashorn Maven Executor
 * 
 * This script is for running Nashorn scripts that depend on Maven artifacts.
 * It will load your dependencies from a .mvn file (see samples), fire Maven
 * to download dependencies for you, then setup the classpath for starting
 * Nashorn and your actual application.
 * 
 * See samples for more information.
 * 
 * To run this script, you must enable the Scripting extension of Nashorn:
 * 
 *   $ jjs -scripting mvn.js -- samples/jaxrs/jaxrs.mvn arg0 arg1 arg2
 *
 *   $ ./mvn.js -- samples/jaxrs/jaxrs.mvn arg0 arg1 arg2
 * 
 * Author: Bruno Borges (@brunoborges)
 * Version: 1.0
 * Since: April 2015
 */
if (arguments.length === 0 || arguments[0] === '-h') {
   print('Usage:');
   print(' $> nasven.js -- [folder/ | folder/appdef.js]');
   print();
   print('An example of appdef.js is as follows:');
   print(" var appdef = {main:'app.js', options:'-scripting -doe ...', dependencies: ['groupId:artifactId:version', ...]}");
   print();
   exit(1);
}

var Nasven = new (function () {
  var JavaString = Java.type("java.lang.String");
  var Collectors = Java.type("java.util.stream.Collectors");
  var Arrays = Java.type("java.util.Arrays");
  var BufferedOutputStream = Java.type("java.io.BufferedOutputStream");
  var Files = Java.type("java.nio.file.Files");
  var Paths = Java.type("java.nio.file.Paths");
  var Charset = Java.type("java.nio.charset.Charset");

  function checkPathExists(path) {
    if (Files.isReadable(path) === false) {
        print("ERROR: File '${path}' cannot be found or is not readable.");
        exit();
    }
  }
  this.checkPathExists = checkPathExists;

  function doMaven() {
    var appDefFile = Paths.get($ARG[0]).toAbsolutePath();
    if (appDefFile.toFile().isFile() === false) {
      appDefFile = Paths.get($ARG[0], 'appdef.js').toAbsolutePath();
    }
    var parentPath = appDefFile.getParent();
    checkPathExists(appDefFile);
    $ENV.PWD = parentPath.toString();

    try {
      load(appDefFile.toString());
    } catch(e) { }

    if (typeof appdef === 'undefined') {
      print("ERROR: Nasven Application Definition 'appdef' object could not be found.");
      exit();
    } else if (typeof appdef.main === 'undefined' || appdef.main === '') {
      print("ERROR: Your 'appdef' object in your ${$ARG[0]} config file does not define 'main'.")
      exit();
    }

    var mainScript = Paths.get(parentPath, appdef.main).toAbsolutePath();
    checkPathExists(mainScript);

    var classpath = '';
    if (typeof appdef.dependencies !== 'undefined') {
      var dependenciesCP = Arrays.stream(Java.to(appdef.dependencies, "java.lang.String[]"))
        .map(function (dep) {return dep.split(":");})
        .map(function (tokens) {
          return <<EOF
              <dependency>
                  <groupId>${tokens[0]}</groupId>
                  <artifactId>${tokens[1]}</artifactId>
                  <version>${tokens[2]}</version>
              </dependency>
          EOF
        })
        .collect(Collectors.joining("\n"));
  
      var pomTemplate = <<EOF
       <project>
          <modelVersion>4.0.0</modelVersion>
          <groupId>nasven</groupId>
          <artifactId>nasven-temp-artifact</artifactId>
          <packaging>pom</packaging>
          <version>1.0-SNAPSHOT</version>
          <name>nasven-temp-artifact</name>
          <dependencies>
            ${dependenciesCP}
          </dependencies>
       </project>
      EOF
  
      var pomFile = Files.createTempFile('pom-', '-' + mainScript.toFile().getName() + '.xml').toAbsolutePath();
      Files.write(pomFile, pomTemplate.getBytes());
  
      var cpFile = Paths.get(parentPath, mainScript.toFile().getName() + '.cp').toAbsolutePath();
      exec("mvn -f ${pomFile} -Dmdep.outputFile=${cpFile} dependency:go-offline dependency:build-classpath verify");
      classpath = '-cp ' + new JavaString(Files.readAllBytes(cpFile));
      Files.delete(cpFile);
    }
  
    $ARG.shift();
    newargs = '-- ' + $ARG.join(" ");
  
    var options = typeof appdef.options === 'undefined' ? '' : appdef.options;
    exec("jjs -DskipNasven=true ${classpath} ${options} ${__DIR__}/mvn.js ${mainScript} ${newargs}");
  }

  var skipNasven = Packages.java.lang.System.getProperty("skipNasven");
  if (skipNasven !== "true") {
    doMaven();
  }

  function exec(args) {
    __exec_input(args, "");
  }
  this.exec = exec;

  function __exec_input(args, input) {
     var StringArray = Java.type("java.lang.String[]");
     var JavaString = Java.type("java.lang.String");
     var CharArray = Java.type("char[]");
     var ProcessBuilder = Java.type("java.lang.ProcessBuilder");
     var Thread = Java.type("java.lang.Thread");
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
         if (key == "PWD") {
             processBuilder.directory(new File(String(value)));
         }

         environment.put(String(key), String(value));
     }

     var process = processBuilder.start();

     var outThread = new Thread(
         function() {
           var buffer = new CharArray(1024);
           var inputStream = new InputStreamReader(process.getInputStream());
           var length;
           while ((length = inputStream.read(buffer, 0, buffer.length)) != -1) {
               print(new JavaString(buffer, 0, length));
           }
           inputStream.close();
       }
     );

     var errThread = new Thread(
         function() {
           var buffer = new CharArray(1024);
           var inputStream = new InputStreamReader(process.getErrorStream());
           var length;
           while ((length = inputStream.read(buffer, 0, buffer.length)) != -1) {
               print(new JavaString(buffer, 0, length));
           }
           inputStream.close();
       }
     );

     outThread.start();
     errThread.start();

     var outputStream = new OutputStreamWriter(process.getOutputStream());
     outputStream.write(input, 0, input.length());
     outputStream.close();

     var exit = process.waitFor();
     outThread.join();
     errThread.join();
  }
 
  this.daemon = function() {
    while(true) {
      Java.type("java.lang.Thread").sleep(1000);
    }
  }
});
