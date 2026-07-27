package org.nasven;

import org.apache.maven.repository.internal.MavenRepositorySystemUtils;
import org.eclipse.aether.DefaultRepositorySystemSession;
import org.eclipse.aether.RepositorySystem;
import org.eclipse.aether.artifact.DefaultArtifact;
import org.eclipse.aether.collection.CollectRequest;
import org.eclipse.aether.graph.Dependency;
import org.eclipse.aether.repository.LocalRepository;
import org.eclipse.aether.repository.RemoteRepository;
import org.eclipse.aether.resolution.DependencyRequest;
import org.eclipse.aether.resolution.DependencyResolutionException;
import org.eclipse.aether.resolution.DependencyResult;
import org.eclipse.aether.supplier.RepositorySystemSupplier;
import org.eclipse.aether.util.filter.DependencyFilterUtils;
import org.eclipse.aether.util.graph.visitor.PreorderNodeListGenerator;

import java.io.File;
import java.nio.file.Path;
import java.util.LinkedHashSet;
import java.util.List;

final class DependencyResolver {
    private static final RemoteRepository CENTRAL = new RemoteRepository.Builder(
            "central", "default", "https://repo.maven.apache.org/maven2/").build();

    private final Path localRepository;
    private final List<RemoteRepository> remoteRepositories;

    DependencyResolver(Path localRepository) {
        this(localRepository, List.of(CENTRAL));
    }

    DependencyResolver(Path localRepository, List<RemoteRepository> remoteRepositories) {
        this.localRepository = localRepository;
        this.remoteRepositories = List.copyOf(remoteRepositories);
    }

    List<Path> resolve(List<MavenCoordinate> coordinates) throws NasvenException {
        if (coordinates.isEmpty()) {
            return List.of();
        }

        RepositorySystem system = new RepositorySystemSupplier().get();
        DefaultRepositorySystemSession session = MavenRepositorySystemUtils.newSession();
        session.setLocalRepositoryManager(
                system.newLocalRepositoryManager(session, new LocalRepository(localRepository.toFile())));

        CollectRequest collectRequest = new CollectRequest();
        remoteRepositories.forEach(collectRequest::addRepository);
        for (MavenCoordinate coordinate : coordinates) {
            collectRequest.addDependency(new Dependency(
                    new DefaultArtifact(coordinate.artifactCoordinate()), "runtime"));
        }

        DependencyRequest request = new DependencyRequest(
                collectRequest, DependencyFilterUtils.classpathFilter("runtime"));
        try {
            DependencyResult result = system.resolveDependencies(session, request);
            PreorderNodeListGenerator generator = new PreorderNodeListGenerator();
            result.getRoot().accept(generator);
            LinkedHashSet<Path> paths = new LinkedHashSet<>();
            for (Object value : generator.getFiles()) {
                paths.add(((File) value).toPath().toAbsolutePath().normalize());
            }
            return List.copyOf(paths);
        } catch (DependencyResolutionException e) {
            throw new NasvenException(3, "Unable to resolve application dependencies: " + e.getMessage(), e);
        }
    }
}
