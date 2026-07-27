package org.nasven;

record MavenCoordinate(String groupId, String artifactId, String version) {
    static MavenCoordinate parse(String value) throws NasvenException {
        if (value == null) {
            throw invalid("null");
        }
        String[] parts = value.split(":", -1);
        if (parts.length != 3 || parts[0].isBlank() || parts[1].isBlank() || parts[2].isBlank()) {
            throw invalid(value);
        }
        return new MavenCoordinate(parts[0], parts[1], parts[2]);
    }

    private static NasvenException invalid(String value) {
        return new NasvenException(
                2,
                "Invalid Maven coordinate '" + value + "'. Expected groupId:artifactId:version.");
    }

    String artifactCoordinate() {
        return groupId + ":" + artifactId + ":" + version;
    }
}
