var tomcatVersion = '8.0.21';

var appdef = {
  main: 'index.js',
  options: '-scripting', 
  dependencies: [
    "org.apache.tomcat.embed:tomcat-embed-core:${tomcatVersion}"
    ,"org.apache.tomcat.embed:tomcat-embed-logging-juli:${tomcatVersion}"
  ]
}
