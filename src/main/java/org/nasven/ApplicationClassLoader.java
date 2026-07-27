package org.nasven;

import java.net.URL;
import java.net.URLClassLoader;

final class ApplicationClassLoader extends URLClassLoader {
    private static final String[] PARENT_FIRST_PACKAGES = {
            "java.",
            "jdk.",
            "sun.",
            "org.graalvm.",
            "com.oracle.truffle.",
            "org.nasven."
    };

    ApplicationClassLoader(URL[] urls, ClassLoader parent) {
        super(urls, parent);
    }

    @Override
    protected Class<?> loadClass(String name, boolean resolve) throws ClassNotFoundException {
        synchronized (getClassLoadingLock(name)) {
            Class<?> loaded = findLoadedClass(name);
            if (loaded == null) {
                if (isParentFirst(name)) {
                    loaded = super.loadClass(name, false);
                } else {
                    try {
                        loaded = findClass(name);
                    } catch (ClassNotFoundException ignored) {
                        loaded = super.loadClass(name, false);
                    }
                }
            }
            if (resolve) {
                resolveClass(loaded);
            }
            return loaded;
        }
    }

    private static boolean isParentFirst(String className) {
        for (String packageName : PARENT_FIRST_PACKAGES) {
            if (className.startsWith(packageName)) {
                return true;
            }
        }
        return false;
    }
}
