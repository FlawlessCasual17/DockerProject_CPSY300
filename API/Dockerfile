FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 7199
EXPOSE 8079

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Development
WORKDIR /src
ADD . ./API
WORKDIR /src/API
RUN exec bash # switch the shell to BASH
RUN pwd
RUN ls -la
RUN chmod +x ./dotenv-check && ./dotenv-check
RUN if [ "$?" -ne 0 ]; then exit 1; fi # Check exit code
RUN rm -r ./obj ./bin
RUN dotnet restore .
RUN dotnet build . -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Development
RUN dotnet publish . -c $BUILD_CONFIGURATION '/p:UseAppHost=false' -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "API.dll"]
