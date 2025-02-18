# Docker Project for CPSY300

A (WIP) description.

## Building and Running

To build the app execute,

```sh
dotnet build .
```

To build AND run the app, execute,

```sh
dotnet run . --launch-profile http
```

To run the app (without building), execute,

```sh
dotnet run . --no-build --launch-profile http
```

## Docker/Podman

If you have Docker or Podman installed, you can run the app easily by using,

Docker

```sh
docker compose up -d
```

Podman

```sh
podman compose up -d
```

Using the compose option is the recommended way to run the app. It will build the ima

### Building the Image

If you just want to build the image, run either of the following,

<details>
<summary>API</summary>

Docker

```sh
docker build -f ./API/Dockerfile -t student-api
```

Podman

```sh
podman build -f ./API/Dockerfile -t student-api
```


</details>



<details>

<summary>Web App</summary>

Docker

```sh
docker build -f ./WebApp/Dockerfile -t student-api-webapp
```

Podman

```sh
podman build -f ./WebApp/Dockerfile -t student-api-webapp
```

</details>
