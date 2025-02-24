FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 7199
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Development
# Set shell to bash
RUN exec /bin/bash
# Install rsync
RUN sh -c 'apt update && apt install -y rsync' > /dev/null
RUN sh -c 'apt autoremove -y && apt autoremove -y && apt clean -y' > /dev/null
WORKDIR /src
COPY *.csproj './API/'
RUN pwd; ls -la
WORKDIR /src/API
RUN pwd; ls -la
RUN dotnet restore . --disable-parallel --use-lock-file
RUN pwd; ls -la
# Copy to a temporary directory
COPY . './tmp/'
# Then copy everything else except /bin/, /obj/, *.csproj
RUN rsync -r --no-R '--exclude=/bin' '--exclude=/obj' '--exclude=*.csproj' ./tmp/ . > /dev/null
# Remove the temporary directory
RUN rm -rf ./tmp
RUN pwd; ls -la
RUN chmod +x ./dotenv-check && ./dotenv-check
# Check exit code
RUN if [ "$?" -ne 0 ]; then exit 1; fi
RUN dotnet build . -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Development
RUN dotnet publish . -c $BUILD_CONFIGURATION \
    '/p:UseAppHost=false' -o /app/publish

FROM base AS final
WORKDIR '/app'
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "API.dll"]
