var StringUtils = Java.type("org.apache.commons.lang3.StringUtils");
require("helper.js");
require("helper.js");

if (arguments.length !== 1 || arguments[0] !== "argument with spaces") {
    throw new Error("Argument forwarding failed: " + JSON.stringify(arguments));
}
if (!StringUtils.isNotBlank("resolved") || requiredValue !== "required") {
    throw new Error("Dependency class loading or require failed");
}

console.log("Nasven packaged end-to-end test passed");
