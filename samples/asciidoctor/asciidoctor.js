var Paths = Packages.java.nio.file.Paths;
var Files = Packages.java.nio.file.Files;
var Factory = Packages.org.asciidoctor.Asciidoctor.Factory;
var Asciidoctor = Packages.org.asciidoctor.Asciidoctor;
var OptionsBuilder = org.asciidoctor.OptionsBuilder;

var sample = new java.lang.String(Files.readAllBytes(Paths.get("mysample.adoc")));

var asciidoctor = Factory.create(Factory.class.getClassLoader());
var html = asciidoctor.convert(sample, OptionsBuilder.options().get());

print(html);
