package org.nasven;

import java.nio.file.Path;
import java.util.List;

record AppDefinition(
        String name,
        String version,
        Path manifest,
        Path root,
        Path mainScript,
        List<MavenCoordinate> dependencies,
        String options) {
}
