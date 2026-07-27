var CSVFormat = Java.type("org.apache.commons.csv.CSVFormat");
var StringReader = Java.type("java.io.StringReader");
var LoggerFactory = Java.type("org.slf4j.LoggerFactory");
require("helper.js");
require("helper.js");

if (arguments.length !== 1 || arguments[0] !== "argument with spaces") {
    throw new Error("Argument forwarding failed: " + JSON.stringify(arguments));
}
var record = CSVFormat.DEFAULT.parse(new StringReader("transitive")).iterator().next();
if (record.get(0) !== "transitive" || requiredValue !== "required") {
    throw new Error("Transitive dependency class loading or require failed");
}
if (LoggerFactory.getILoggerFactory().getClass().getName() !== "org.slf4j.impl.SimpleLoggerFactory") {
    throw new Error("Application logging implementation was not isolated from Nasven");
}

console.log("Nasven packaged end-to-end test passed");
