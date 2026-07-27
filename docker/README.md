# Nasven container

The Dockerfile uses a JDK 25 Maven builder and a JDK 25 runtime image. It builds the current local checkout, copies the executable Nasven JAR and launcher into the runtime image, and runs a JavaScript smoke application during the image build.

```sh
docker build -f docker/Dockerfile -t nasven.js-local .
```

The default application path is `/app`:

```sh
docker run --rm -v "$PWD/my-app:/app" nasven.js-local
```

To select another path or pass arguments, provide the application path first:

```sh
docker run --rm \
  -v "$PWD/my-app:/work/app" \
  nasven.js-local /work/app arg0 "argument with spaces"
```

Application Maven dependencies are downloaded at runtime and cached inside the container unless a Maven repository volume is mounted.
