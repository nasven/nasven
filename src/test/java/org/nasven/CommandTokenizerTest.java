package org.nasven;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CommandTokenizerTest {
    @Test
    void preservesQuotedAndEmptyArguments() {
        assertEquals(
                List.of("command", "argument with spaces", "", "escaped value"),
                CommandTokenizer.tokenize("command 'argument with spaces' \"\" escaped\\ value"));
    }

    @Test
    void rejectsUnterminatedQuotes() {
        assertThrows(
                IllegalArgumentException.class,
                () -> CommandTokenizer.tokenize("command 'unterminated"));
    }
}
