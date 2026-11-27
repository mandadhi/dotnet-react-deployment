FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /app

COPY *.csproj .

RUN dotnet restore

COPY . .

RUN dotnet publish -c Release --no-restore -o artifact

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/artifact .

ENV ASPNETCORE_URLS=http://+:5153

EXPOSE 5153

ENTRYPOINT [ "dotnet", "dotnet-dev-proj.dll" ]


