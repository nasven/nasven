var Server = Packages.org.eclipse.jetty.server.Server;

var server = new Server(8080);
server.start();
server.dumpStdErr();
server.join();
