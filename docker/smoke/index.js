if (arguments[0] !== "docker-smoke") {
    throw new Error("Docker argument forwarding failed");
}
console.log("Nasven Docker smoke test passed");
