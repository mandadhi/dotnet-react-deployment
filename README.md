# .NET + React Docker Deployment

A full-stack sample application with a React frontend built with Vite and a .NET Web API backend. Each service runs in its own Docker container, and Docker Compose builds and connects the services for local development or Codespaces.

## Project Overview

- **Frontend:** React + Vite, served on port `5173`.
- **Backend:** ASP.NET Core Web API, listening on port `5153`.
- **Containers:** Separate Docker images are built from `react-dev-proj/Dockerfile` and `dotnet-dev-proj/Dockerfile`.
- **Orchestration:** Docker Compose starts both services and connects them to a custom bridge network named `devnetwork`.

The sample API exposes a weather forecast endpoint at `/weatherforecast`.

## Architecture & How It Works

Compose publishes each service port to the Docker host and attaches both containers to `devnetwork`.

```text
                            Docker host / Codespaces VM
  User's browser            ┌──────────────────────────────────────────┐
  ┌──────────────────┐      │  ┌──────────────────┐                    │
  │ React UI         │─────▶│  │ frontend         │                    │
  │ localhost:5173   │      │  │ Vite :5173       │                    │
  └──────────────────┘      │  └────────┬─────────┘                    │
          │                 │           │ optional Vite reverse proxy  │
          │ direct API call │           │ http://backend:5153          │
          ▼                 │           ▼                              │
  forwarded/published       │  ┌──────────────────┐                    │
  host port 5153 ──────────▶│  │ backend          │                    │
                            │  │ .NET API :5153   │                    │
                            │  └──────────────────┘                    │
                            │       devnetwork (bridge)                │
                            └──────────────────────────────────────────┘
```

### Docker's Internal DNS

Within `devnetwork`, Docker provides DNS resolution for Compose service names. A container can reach the backend using `http://backend:5153`; Docker resolves `backend` to the backend container's current IP address. This is useful when a Vite development-server reverse proxy forwards API requests from the frontend container to the backend container.

That Docker DNS name is **only available to containers on the Docker network**. A user's browser runs outside that network, so browser-side JavaScript cannot resolve `http://backend:5153`. Browser requests must instead use a host-published address or a forwarded URL. Alternatively, route browser requests through a Vite proxy running in the frontend container; that proxy can then call `http://backend:5153` internally.

## Why Docker Compose (`docker-compose.yaml`) Is Used

The root `docker-compose.yaml` defines both services, their build contexts, published ports, and their shared bridge network. Compose:

- Builds the backend image from `dotnet-dev-proj` and the frontend image from `react-dev-proj`.
- Starts both containers together with one command: `docker compose up --build`.
- Simplifies startup and shutdown, port publishing, and service-to-service networking.

The Compose file is named `docker-compose.yaml` in this repository; Docker Compose recognizes it when run from the repository root.

## Running in GitHub Codespaces vs. Local Machine

### GitHub Codespaces

`localhost` in your **local browser** refers to your own computer, not the Codespaces cloud VM. Codespaces forwards ports from the VM and provides browser-accessible URLs for them.

To call the backend directly from frontend browser code (without a Vite reverse proxy):

1. Start the stack and open the **Ports** tab in Codespaces.
2. Find port `5153` and change its visibility to **Public** (only do this when appropriate for your project and data).
3. Copy the forwarded URL. It has the form `https://<codespace-name>-5153.app.github.dev`.
4. Configure the frontend to use that URL as its API base URL, including the desired endpoint path (for example, `/weatherforecast`).
5. Ensure CORS is enabled and allows the frontend's origin on the .NET backend. The sample backend currently enables a permissive CORS policy; tighten it to trusted origins for production use.

A Vite reverse proxy is another option: the browser calls the frontend's forwarded URL, and the proxy in the frontend container calls `http://backend:5153` over `devnetwork`.

### Local Machine

When running Docker locally, the published port makes the backend reachable from the local browser at `http://localhost:5153` (for example, `http://localhost:5153/weatherforecast`). The frontend is available at `http://localhost:5173`. Ensure the corresponding port mappings remain configured in the Compose file. Browser requests across these origins require the backend's CORS policy to allow the frontend origin.

## Quick Start

You need Docker with Docker Compose installed.

```bash
git clone https://github.com/mandadhi/dotnet-react-deployment.git
cd dotnet-react-deployment

docker compose up --build
```

Once the containers are running:

- Open the frontend at [http://localhost:5173](http://localhost:5173).
- Reach the API at [http://localhost:5153/weatherforecast](http://localhost:5153/weatherforecast).

Stop and remove the containers and Compose-created network with:

```bash
docker compose down
```

To stop the foreground process, press `Ctrl+C` first, then run `docker compose down` from the repository root.
