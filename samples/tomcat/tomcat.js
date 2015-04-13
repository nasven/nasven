var webappDirLocation = "web";
var Tomcat = Packages.org.apache.catalina.startup.Tomcat;
var tomcat = new Tomcat;

tomcat.setPort(8080);
tomcat.setBaseDir("web");
tomcat.addWebapp("", new Packages.java.io.File(webappDirLocation).getAbsolutePath());
tomcat.start();
tomcat.getServer().await();
