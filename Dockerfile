FROM microsoft/dotnet-sdk:9.0 AS build
WORKDIR /
COPY ["DockerProject_CPSY300.csproj", "."]
RUN dotnet restore "DockerProject_CPSY300.csproj"
COPY . .
RUN dotnet build "DockerProject_CPSY300.csproj" -c Development -o /app/build
