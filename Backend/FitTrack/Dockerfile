FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

COPY *.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/out .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

# CreateBuilder puts a FileSystemWatcher on every appsettings file so config can
# reload at runtime. The host runs out of inotify instances (limit 128) and the
# process dies before Program.cs gets going. Config never changes inside an
# immutable image, so drop the watchers.
ENV DOTNET_hostBuilder__reloadConfigOnChange=false

ENTRYPOINT ["dotnet", "FitTrack.dll"]