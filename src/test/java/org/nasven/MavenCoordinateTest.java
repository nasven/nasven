package org.nasven;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MavenCoordinateTest {
    @Test
    void parsesLegacyCoordinate() throws Exception {
        MavenCoordinate coordinate = MavenCoordinate.parse("org.example:library:1.2.3");

        assertEquals("org.example", coordinate.groupId());
        assertEquals("library", coordinate.artifactId());
        assertEquals("1.2.3", coordinate.version());
        assertEquals("org.example:library:1.2.3", coordinate.artifactCoordinate());
    }

    @Test
    void rejectsMalformedCoordinate() {
        NasvenException error = assertThrows(
                NasvenException.class, () -> MavenCoordinate.parse("org.example:library"));

        assertEquals(2, error.exitCode());
    }
}
