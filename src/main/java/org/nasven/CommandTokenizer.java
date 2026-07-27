package org.nasven;

import java.util.ArrayList;
import java.util.List;

final class CommandTokenizer {
    private CommandTokenizer() {
    }

    static List<String> tokenize(String command) {
        if (command == null || command.isBlank()) {
            throw new IllegalArgumentException("Command must not be empty.");
        }

        List<String> tokens = new ArrayList<>();
        StringBuilder token = new StringBuilder();
        boolean singleQuoted = false;
        boolean doubleQuoted = false;
        boolean escaping = false;
        boolean tokenStarted = false;

        for (int index = 0; index < command.length(); index++) {
            char current = command.charAt(index);
            if (escaping) {
                token.append(current);
                escaping = false;
                tokenStarted = true;
            } else if (current == '\\' && !singleQuoted) {
                escaping = true;
                tokenStarted = true;
            } else if (current == '\'' && !doubleQuoted) {
                singleQuoted = !singleQuoted;
                tokenStarted = true;
            } else if (current == '"' && !singleQuoted) {
                doubleQuoted = !doubleQuoted;
                tokenStarted = true;
            } else if (Character.isWhitespace(current) && !singleQuoted && !doubleQuoted) {
                if (tokenStarted) {
                    tokens.add(token.toString());
                    token.setLength(0);
                    tokenStarted = false;
                }
            } else {
                token.append(current);
                tokenStarted = true;
            }
        }

        if (escaping || singleQuoted || doubleQuoted) {
            throw new IllegalArgumentException("Command contains an unterminated quote or escape.");
        }
        if (tokenStarted) {
            tokens.add(token.toString());
        }
        return List.copyOf(tokens);
    }
}
