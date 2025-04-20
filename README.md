# Docker Project for CPSY300

My submission for the Docker Project for CPSY300.

<!--toc:start-->
- [Docker Project for CPSY300](#docker-project-for-cpsy300)
  - [:package: Building and Running :rocket:](#package-building-and-running-rocket)
  - [:whale: Docker / Podman :otter:](#whale-docker-podman-otter)
    - [:package: Building the Image](#package-building-the-image)
<!--toc:end-->

## :package: Building and Running :rocket:

<details>
<summary>API</summary>

The API is built using the [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet) framework.

To run or build the API, you will need to have the [dotNET SDK](https://dotnet.microsoft.com/) installed.

Before doing any of the tasks below, make sure to run,

```sh
dotnet restore .
```

To build the API execute,

```sh
dotnet build .
```

To build AND run the API, execute,

```sh
dotnet run . --launch-profile http
```

To run the API (without building), execute,

```sh
dotnet run . --no-build --launch-profile http
```

</details>

<details>
<summary>Web App</summary>

The Web App is built using the [Astro framework](https://astro.build/), [SolidJS](https://www.solidjs.com/), and [TailwindCSS](https://tailwindcss.com/).

To run or build the Web App, you will need to have the [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/) installed.

Before doing any of the tasks below, make sure to run,

```sh
pnpm install
```

To run the Web App, execute,

```sh
pnpm run dev
```

To build the Web App execute,

```sh
pnpm run build
```

</details>

## :whale: Docker / Podman :otter:

> [!NOTE]
> The command, `podman compose` is not the same as `podman-compose`.
> The `podman compose` command will either use `docker-compose` or
> `podman-compose` depending on which is installed.
> If you have both installed, `podman compose` will
> use `docker-compose` over `podman-compose`.
> There is currently no way to override this
> behavior for the command, `podman compose`.

If you have Docker or Podman installed, you can run
the app easily by using, `docker compose` or `podman compose`,

* **Docker**

  ```sh
  docker-compose up -d
  ```

* **Podman**

  ```sh
  podman-compose up -d
  ```

Using either choice is the recommended way to
run the app as it will build the image first, then run it.

### :package: Building the Image

If you just want to build the image, run either of the following,

<details>
<summary><ins>API</ins></summary>

* :whale: **Docker**

  ```sh
  docker-compose build student_api
  ```

* :otter: **Podman**

  ```sh
  podman-compose build student_api
  ```

</details>

<details>

<summary><ins>Web App</ins></summary>

* :whale: **Docker**

  ```sh
  docker-compose build web_app
  ```

* :otter: **Podman**

  ```sh
  podman-compose build web_app
  ```

</details>
